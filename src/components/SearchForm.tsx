import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  MagnifyingGlassIcon,
  MapPinIcon,
  TagIcon,
  CalendarDaysIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import ChipInput, { type ChipItem } from "./ChipInput";
import ChipLocationInput, { type LocationChip } from "./ChipLocationInput";
import Pikaday from "pikaday";
import "pikaday/css/pikaday.css";
import { DANISH_DATE_PATTERN, isValidDanishDateString, toApiDateString, toDateFromInput, formatDateForDisplay } from "../helpers/date";

type SearchParams = {
  searchTerms?: string[];
  locations?: string[];
  categoryKeys?: string[];
  postedAfter?: string;
  postedBefore?: string;
  // Legacy single-value fields for backward compatibility
  searchTerm?: string;
  location?: string;
  locationSlug?: string;
  categoryId?: number;
  categoryKey?: string;
};

export type CategoryOption = {
  id?: number;
  key?: string;
  name: string;
  label?: string;
  count?: number;
  numberOfJobs?: number;
};

type CategoryInput = CategoryOption | string;

type ValueChip = {
  value: string;
};

interface Props {
  onSearch: (params: SearchParams) => void;
  categories: CategoryInput[];
  // Optional raw category (id or name) from query param to preselect
  queryCategory?: string;
}

const formatCategoryLabel = (category: CategoryOption) => {
  const count = category.numberOfJobs ?? category.count;
  const countSuffix = count ? ` (${count})` : "";
  return `${category.name}${countSuffix}`;
};

const collectChipValues = <T extends ValueChip>(chips: T[], pendingInput: string) => {
  const values = chips.map((chip) => chip.value);
  const trimmedPendingInput = pendingInput.trim();

  if (trimmedPendingInput.length === 0) {
    return values;
  }

  return [...values, trimmedPendingInput];
};

const collectCategoryKeys = (chips: ChipItem[], categories: CategoryOption[]) => {
  const keys: string[] = [];

  chips.forEach((chip) => {
    const directId = typeof chip.id === "number" ? chip.id : undefined;
    const match = directId != null
      ? categories.find((category) => category.id === directId)
      : categories.find((category) => category.name === chip.value || category.label === chip.label);
    const key = match?.key ?? match?.name;
    if (key && !keys.includes(key)) {
      keys.push(key);
    }
  });

  return keys;
};

const buildSearchParams = (
  searchTermChips: ChipItem[],
  searchTermInputValue: string,
  locationChips: LocationChip[],
  locationInputValue: string,
  categoryChips: ChipItem[],
  normalizedCategories: CategoryOption[],
  postedAfter: string,
  postedBefore: string
): SearchParams => {
  const postedAfterApi = postedAfter ? toApiDateString(postedAfter) ?? undefined : undefined;
  const postedBeforeApi = postedBefore ? toApiDateString(postedBefore) ?? undefined : undefined;
  const searchTermsArray = collectChipValues(searchTermChips, searchTermInputValue).filter((value) => value.length > 0);
  const locationsArray = collectChipValues(locationChips, locationInputValue).filter((value) => value.length > 0);
  const categoryKeysArray = collectCategoryKeys(categoryChips, normalizedCategories);

  return {
    searchTerms: searchTermsArray.length > 0 ? searchTermsArray : undefined,
    locations: locationsArray.length > 0 ? locationsArray : undefined,
    categoryKeys: categoryKeysArray.length > 0 ? categoryKeysArray : undefined,
    searchTerm: searchTermsArray[0],
    location: locationsArray[0],
    categoryKey: categoryKeysArray[0],
    postedAfter: postedAfterApi,
    postedBefore: postedBeforeApi,
  };
};

const SearchForm: React.FC<Props> = ({ onSearch, categories, queryCategory }) => {
  // Chip-based state for multiple values
  const [searchTermChips, setSearchTermChips] = useState<ChipItem[]>([]);
  const [locationChips, setLocationChips] = useState<LocationChip[]>([]);
  const [categoryChips, setCategoryChips] = useState<ChipItem[]>([]);
  
  // Category typeahead state
  const [categoryInputValue, setCategoryInputValue] = useState("");
  
  // Track pending input values that haven't been converted to chips yet
  const [searchTermInputValue, setSearchTermInputValue] = useState("");
  const [locationInputValue, setLocationInputValue] = useState("");
  
  // Date pickers
  const [postedAfter, setPostedAfter] = useState("");
  const [postedBefore, setPostedBefore] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const postedAfterInputRef = useRef<HTMLInputElement | null>(null);
  const postedBeforeInputRef = useRef<HTMLInputElement | null>(null);
  const postedAfterPickerRef = useRef<Pikaday | null>(null);
  const postedBeforePickerRef = useRef<Pikaday | null>(null);

  const MAX_SUGGESTIONS = 8;

  const normalizeCategoryValue = (value: string) => value.replace(/\s+\(\d+\)\s*$/, "").trim();

  const normalizedCategories = React.useMemo<CategoryOption[]>(() => {
    return categories.map(c => {
      if (typeof c === "string") {
        const countMatch = /\((\d+)\)\s*$/.exec(c);
        const count = countMatch ? Number(countMatch[1]) : undefined;
        const name = normalizeCategoryValue(c);
        return { id: undefined, name, label: c, count };
      }
      // Ensure label is set for object categories
      return {
        ...c,
        label: c.label ?? formatCategoryLabel(c),
      };
    });
  }, [categories]);

  // Convert categories to ChipItem format for suggestions
  const categorySuggestionItems = React.useMemo<ChipItem[]>(() => {
    const query = categoryInputValue.toLowerCase();
    return normalizedCategories
      .filter(c => {
        if (!query) return true;
        const name = c.name?.toLowerCase() ?? "";
        const label = c.label?.toLowerCase() ?? "";
        return name.includes(query) || label.includes(query);
      })
      .slice(0, MAX_SUGGESTIONS)
      .map(c => ({
        id: c.id ?? `cat-${c.name}`,
        label: c.label ?? c.name,
        value: c.name,
      }));
  }, [normalizedCategories, categoryInputValue]);

  // Sync incoming query category into the local category state (match by id or name)
  React.useEffect(() => {
    if (!queryCategory) return;
    if (categoryChips.length > 0) return;

    const numeric = Number(queryCategory);
    const match = Number.isFinite(numeric)
      ? normalizedCategories.find(c => c.id === numeric)
      : normalizedCategories.find(c => c.key === queryCategory || c.name === queryCategory || c.label === queryCategory);
    if (match) {
      setCategoryChips([{
        id: match.id ?? `cat-${match.name}`,
        label: match.label ?? match.name,
        value: match.name,
      }]);
    }
  }, [queryCategory, normalizedCategories, categoryChips.length]);

  useEffect(() => {
    const toUtcMidnight = (d: Date) => new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));

    const setupPicker = (
      inputEl: HTMLInputElement | null,
      existing: Pikaday | null,
      onSelect: (date: Date) => void
    ): Pikaday | null => {
      if (!inputEl) return null;
      if (existing) return existing;
      return new Pikaday({
        field: inputEl,
        format: "DD/MM/YYYY",
        minDate: new Date(1900, 0, 1),
        yearRange: [1900, new Date().getFullYear()],
        toString: (date: Date) => formatDateForDisplay(toUtcMidnight(date)) ?? "",
        // Do not default empty/invalid input to today; keep empty instead
        parse: (dateString: string) => toDateFromInput(dateString) ?? null,
        onSelect,
        setDefaultDate: false,
      });
    };

    postedAfterPickerRef.current = setupPicker(postedAfterInputRef.current, postedAfterPickerRef.current, (d) => {
      const utc = toUtcMidnight(d);
      setPostedAfter(formatDateForDisplay(utc) ?? "");
    });

    postedBeforePickerRef.current = setupPicker(postedBeforeInputRef.current, postedBeforePickerRef.current, (d) => {
      const utc = toUtcMidnight(d);
      setPostedBefore(formatDateForDisplay(utc) ?? "");
    });

    return () => {
      if (postedAfterPickerRef.current) { postedAfterPickerRef.current.destroy(); postedAfterPickerRef.current = null; }
      if (postedBeforePickerRef.current) { postedBeforePickerRef.current.destroy(); postedBeforePickerRef.current = null; }
    };
  }, []);

  useEffect(() => {
    if (postedAfterPickerRef.current && postedAfter) {
      const parsed = toDateFromInput(postedAfter);
      if (parsed) postedAfterPickerRef.current.setDate(parsed, true);
    }
    if (postedBeforePickerRef.current && postedBefore) {
      const parsed = toDateFromInput(postedBefore);
      if (parsed) postedBeforePickerRef.current.setDate(parsed, true);
    }
  }, [postedAfter, postedBefore]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);

    onSearch(
      buildSearchParams(
        searchTermChips,
        searchTermInputValue,
        locationChips,
        locationInputValue,
        categoryChips,
        normalizedCategories,
        postedAfter,
        postedBefore
      )
    );
  };

  const handleReset = () => {
    setSearchTermChips([]);
    setLocationChips([]);
    setCategoryChips([]);
    setCategoryInputValue("");
    setSearchTermInputValue("");
    setLocationInputValue("");
    setPostedAfter("");
    setPostedBefore("");
    setSubmitted(false);
    onSearch({});
  };

  const postedAfterValid = !postedAfter || isValidDanishDateString(postedAfter);
  const postedBeforeValid = !postedBefore || isValidDanishDateString(postedBefore);

  const successClass = (base: string, condition: boolean) =>
    condition && submitted ? `${base} input-success` : base;

  const dateInputClass =
    "input input-bordered w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-base-content/45";

  // Handle category chip changes
  const handleCategoryChipsChange = useCallback((chips: ChipItem[]) => {
    setCategoryChips(chips);
  }, []);

  const fieldCardClass =
    "flex h-full flex-col gap-3 rounded-[1.25rem] border border-base-300/70 bg-base-100/85 p-3 shadow-sm";

  const labelTextClass =
    "label-text text-sm font-semibold uppercase tracking-[0.16em] text-base-content/60";

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary/80">Præciser din søgning</p>
          <p className="text-base leading-6 text-base-content/72">Kombinér jobtitler, lokationer og kategorier i samme søgning.</p>
        </div>
        <p className="text-sm leading-6 text-base-content/60">Tip: Tryk Enter eller skriv komma for at tilføje flere søgeord og byer.</p>
      </div>

      <fieldset className="grid gap-3 xl:grid-cols-12">
        <legend className="sr-only">Søgefiltre</legend>
        <div className="xl:col-span-4">
          <div className={fieldCardClass}>
            <label className="label p-0" htmlFor="searchTerm">
              <span className={`inline-flex items-center gap-2 ${labelTextClass}`}>
                <MagnifyingGlassIcon className="w-4 h-4" aria-hidden="true" />
                Søgeord
              </span>
            </label>
            <ChipInput
              chips={searchTermChips}
              onChipsChange={setSearchTermChips}
              placeholder="Skriv søgeord..."
              allowFreeText={true}
              inputId="searchTerm"
              ariaLabel="Søgeord"
              className="shadow"
              onInputChange={setSearchTermInputValue}
              inputValue={searchTermInputValue}
            />
            <p className="text-sm leading-6 text-base-content/60">Søg på jobtitler, teknologier eller konkrete kompetencer.</p>
          </div>
        </div>
        <div className="xl:col-span-3">
          <div className={fieldCardClass}>
            <label className="label p-0" htmlFor="locationInput">
              <span className={`inline-flex items-center gap-2 ${labelTextClass}`}>
                <MapPinIcon className="w-4 h-4" aria-hidden="true" />
                Lokation
              </span>
            </label>
            <ChipLocationInput
              chips={locationChips}
              onChipsChange={setLocationChips}
              placeholder="Skriv lokation..."
              inputId="locationInput"
              ariaLabel="Lokation"
              className="shadow"
              onInputChange={setLocationInputValue}
              inputValue={locationInputValue}
            />
            <p className="text-sm leading-6 text-base-content/60">Tilføj byer eller områder for at ramme de rette opslag hurtigere.</p>
          </div>
        </div>
        <div className="xl:col-span-3">
          <div className={fieldCardClass}>
            <label className="label p-0" htmlFor="categoryInput">
              <span className={`inline-flex items-center gap-2 ${labelTextClass}`}>
                <TagIcon className="w-4 h-4" aria-hidden="true" />
                Kategori
              </span>
            </label>
            <ChipInput
              chips={categoryChips}
              onChipsChange={handleCategoryChipsChange}
              placeholder="Vælg kategori..."
              allowFreeText={false}
              suggestions={categorySuggestionItems}
              onInputChange={setCategoryInputValue}
              inputValue={categoryInputValue}
              showSuggestionsOnFocus={true}
              inputId="categoryInput"
              ariaLabel="Kategori"
              className="shadow"
            />
            <p className="text-sm leading-6 text-base-content/60">Vælg en eller flere fagområder for at gøre brede søgninger mere præcise.</p>
          </div>
        </div>
        <div className="xl:col-span-2">
          <div className={fieldCardClass}>
            <label className="label p-0" htmlFor="postedAfter">
              <span className={`inline-flex items-center gap-2 ${labelTextClass}`}>
                <CalendarDaysIcon className="w-4 h-4" aria-hidden="true" />
                Dato
              </span>
            </label>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="form-control gap-2">
                <label className="label p-0" htmlFor="postedAfter">
                  <span className="label-text text-sm font-medium text-base-content/65">Opslag efter</span>
                </label>
                <input
                  id="postedAfter"
                  type="text"
                  inputMode="numeric"
                  className={successClass(dateInputClass, postedAfterValid && !!postedAfter)}
                  value={postedAfter}
                  onChange={e => setPostedAfter(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  pattern={DANISH_DATE_PATTERN.source}
                  aria-label="Opslag efter dato"
                  aria-invalid={Boolean(postedAfter) && !postedAfterValid}
                  ref={postedAfterInputRef}
                />
              </div>
              <div className="form-control gap-2">
                <label className="label p-0" htmlFor="postedBefore">
                  <span className="label-text text-sm font-medium text-base-content/65">Opslag før</span>
                </label>
                <input
                  id="postedBefore"
                  type="text"
                  inputMode="numeric"
                  className={successClass(dateInputClass, postedBeforeValid && !!postedBefore)}
                  value={postedBefore}
                  onChange={e => setPostedBefore(e.target.value)}
                  placeholder="dd/mm/yyyy"
                  pattern={DANISH_DATE_PATTERN.source}
                  aria-label="Opslag før dato"
                  aria-invalid={Boolean(postedBefore) && !postedBeforeValid}
                  ref={postedBeforeInputRef}
                />
              </div>
            </div>
            <p className="text-sm leading-6 text-base-content/60">Begræns perioden, hvis du vil prioritere nyere jobopslag.</p>
          </div>
        </div>
        <div className="xl:col-span-12">
          <div className="flex flex-col gap-3 rounded-[1.25rem] border border-primary/10 bg-gradient-to-r from-base-100 via-base-100 to-primary/5 p-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-base leading-6 text-base-content/72">Start bredt og tilføj flere chips, hvis du vil gøre resultatet mere præcist.</p>
            <div className="flex flex-col-reverse gap-2 sm:flex-row sm:items-center">
          <button
                className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/80 bg-base-100/70 px-4 shadow-sm"
                type="button"
                onClick={handleReset}
              >
                <ArrowPathIcon className="w-4 h-4" aria-hidden="true" />
                Nulstil
              </button>
              <button className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20" type="submit">
                <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
                Søg
              </button>
            </div>
          </div>
        </div>
      </fieldset>
    </form>
  );
};

export default SearchForm;