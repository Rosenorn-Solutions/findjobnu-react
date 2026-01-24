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
  categoryIds?: number[];
  postedAfter?: string;
  postedBefore?: string;
  // Legacy single-value fields for backward compatibility
  searchTerm?: string;
  location?: string;
  locationSlug?: string;
  categoryId?: number;
};

export type CategoryOption = {
  id?: number;
  name: string;
  label?: string;
  count?: number;
  numberOfJobs?: number;
};

type CategoryInput = CategoryOption | string;

interface Props {
  onSearch: (params: SearchParams) => void;
  categories: CategoryInput[];
  // Optional raw category (id or name) from query param to preselect
  queryCategory?: string;
}

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
        label: c.label ?? `${c.name}${c.numberOfJobs ?? c.count ? ` (${c.numberOfJobs ?? c.count})` : ""}`,
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
      : normalizedCategories.find(c => c.name === queryCategory || c.label === queryCategory);
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
    
    const postedAfterApi = postedAfter ? toApiDateString(postedAfter) ?? undefined : undefined;
    const postedBeforeApi = postedBefore ? toApiDateString(postedBefore) ?? undefined : undefined;

    // Build arrays from chips, including any pending input values
    const searchTermsArray = [
      ...searchTermChips.map(c => c.value),
      ...(searchTermInputValue.trim() ? [searchTermInputValue.trim()] : [])
    ].filter(s => s.length > 0);
    
    const locationsArray = [
      ...locationChips.map(c => c.value),
      ...(locationInputValue.trim() ? [locationInputValue.trim()] : [])
    ].filter(l => l.length > 0);
    
    // For categories, extract IDs from chips
    const categoryIdsArray: number[] = [];
    for (const chip of categoryChips) {
      const id = typeof chip.id === 'number' ? chip.id : undefined;
      if (id && !categoryIdsArray.includes(id)) {
        categoryIdsArray.push(id);
      } else {
        // Try to match by name
        const match = normalizedCategories.find(c => c.name === chip.value || c.label === chip.label);
        if (match?.id && !categoryIdsArray.includes(match.id)) {
          categoryIdsArray.push(match.id);
        }
      }
    }

    onSearch({
      // New array-based fields
      searchTerms: searchTermsArray.length > 0 ? searchTermsArray : undefined,
      locations: locationsArray.length > 0 ? locationsArray : undefined,
      categoryIds: categoryIdsArray.length > 0 ? categoryIdsArray : undefined,
      // Legacy single-value fields for backward compatibility
      searchTerm: searchTermsArray[0],
      location: locationsArray[0],
      categoryId: categoryIdsArray[0],
      postedAfter: postedAfterApi,
      postedBefore: postedBeforeApi,
    });
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
    "input input-bordered shadow transition-colors hover:border-base-content/40 focus:border-base-content focus:outline-2 focus:outline-offset-2";

  // Handle category chip changes
  const handleCategoryChipsChange = useCallback((chips: ChipItem[]) => {
    setCategoryChips(chips);
  }, []);

  const inputWidthClass = "w-full lg:w-64";

  return (
    <form className="flex flex-col" onSubmit={handleSubmit}>
      <fieldset className="fieldset gap-3">
        <legend className="sr-only">Søgefiltre</legend>
        <div className={`relative ${inputWidthClass}`}>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="searchTerm">
              <span className="label-text inline-flex items-center gap-2">
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
          </div>
        </div>
        <div className={`relative ${inputWidthClass}`}>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="locationInput">
              <span className="label-text inline-flex items-center gap-2">
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
          </div>
        </div>
        <div className={`relative ${inputWidthClass}`}>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="categoryInput">
              <span className="label-text inline-flex items-center gap-2">
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
          </div>
        </div>
        <div className={`flex flex-col gap-2 ${inputWidthClass}`}>
          <div className="form-control gap-2">
            <label className="label p-0" htmlFor="postedAfter">
              <span className="label-text inline-flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" aria-hidden="true" />
                Opslag efter
              </span>
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
              <span className="label-text inline-flex items-center gap-2">
                <CalendarDaysIcon className="w-4 h-4" aria-hidden="true" />
                Opslag før
              </span>
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
        <div className={`flex gap-2 ${inputWidthClass}`}>
          <button
            className="btn btn-secondary-ghost shadow min-h-11 min-w-11"
            type="button"
            onClick={handleReset}
          >
            <ArrowPathIcon className="w-4 h-4" aria-hidden="true" />
            Nulstil
          </button>
          <button className="btn btn-primary shadow flex-1 min-h-11" type="submit">
            <MagnifyingGlassIcon className="w-5 h-5" aria-hidden="true" />
            Søg
          </button>
        </div>
      </fieldset>
    </form>
  );
};

export default SearchForm;