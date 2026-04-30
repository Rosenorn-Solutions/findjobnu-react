import React, { useEffect, useMemo, useState } from "react";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  EnvelopeIcon,
  MapPinIcon,
  SparklesIcon,
  TagIcon,
} from "@heroicons/react/24/outline";
import { JobAgentApi, JobIndexPostsApi, ProfileApi } from "../findjobnu-api";
import { JobAgentFrequency } from "../findjobnu-api/models/JobAgentFrequency";
import type { JobAgentDto } from "../findjobnu-api/models/JobAgentDto";
import { createApiClient } from "../helpers/ApiFactory";
import { handleApiError } from "../helpers/ErrorHelper";
import LocationTypeahead from "./LocationTypeahead";

interface Props {
  userId: string;
  accessToken: string;
}

const frequencyValues: Record<"daily" | "weekly" | "monthly", JobAgentFrequency> = {
  daily: (JobAgentFrequency.NUMBER_1 ?? 1) as JobAgentFrequency,
  weekly: (JobAgentFrequency.NUMBER_2 ?? 2) as JobAgentFrequency,
  monthly: (JobAgentFrequency.NUMBER_3 ?? 3) as JobAgentFrequency,
};

const normalizeFrequency = (value: unknown, fallback: JobAgentFrequency = frequencyValues.weekly): JobAgentFrequency => {
  if (
    value === JobAgentFrequency.NUMBER_1 ||
    value === JobAgentFrequency.NUMBER_2 ||
    value === JobAgentFrequency.NUMBER_3
  ) {
    return value;
  }
  return fallback;
};

const frequencyOptions = [
  { value: frequencyValues.daily, label: "Dagligt" },
  { value: frequencyValues.weekly, label: "Ugentligt" },
  { value: frequencyValues.monthly, label: "Månedligt" },
];

type CategoryOption = {
  id: number;
  name: string;
  label: string;
  count: number;
};

const formatCategoryInputValue = (names: string[] | undefined, ids: number[]) => {
  if (names && names.length > 0) {
    return names.join(", ");
  }
  if (ids.length > 0) {
    return ids.join(", ");
  }
  return "";
};

const describeAgentStatus = (mode: "setup" | "manage", enabled: boolean) => {
  if (mode === "setup") {
    return "ikke oprettet endnu";
  }
  if (enabled) {
    return "klar til udsendelse";
  }
  return "gemt som inaktiv";
};

const JobAgentCard: React.FC<Props> = ({ userId, accessToken }) => {
  const frequencySelectId = "jobagent-frequency";
  const locationsInputId = "jobagent-locations";
  const categoriesInputId = "jobagent-categories";
  const keywordsInputId = "jobagent-keywords";
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileId, setProfileId] = useState<number | null>(null);
  const [jobAgent, setJobAgent] = useState<JobAgentDto | null>(null);
  const [enabled, setEnabled] = useState<boolean>(true);
  const [frequency, setFrequency] = useState<JobAgentFrequency>(frequencyValues.weekly);
  const [lastSentAt, setLastSentAt] = useState<Date | null>(null);
  const [nextSendAt, setNextSendAt] = useState<Date | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"setup" | "manage">("setup");
  const [locationsInput, setLocationsInput] = useState<string>("");
  const [categoriesInput, setCategoriesInput] = useState<string>("");
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [categoryOptions, setCategoryOptions] = useState<CategoryOption[]>([]);
  const [categorySuggestions, setCategorySuggestions] = useState<CategoryOption[]>([]);
  const [showCategorySuggestions, setShowCategorySuggestions] = useState(false);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(-1);
  const [keywordsInput, setKeywordsInput] = useState<string>("");
  const [unsubscribeLink, setUnsubscribeLink] = useState<string | null>(null);

  const statusLabel = useMemo(() => {
    if (mode === "setup") return "Ikke oprettet";
    return enabled ? "Aktiv" : "Inaktiv";
  }, [enabled, mode]);

  const categoryDelimiter = ",";

  const splitTokens = (raw: string) => raw.split(categoryDelimiter).map((t) => t.trim()).filter((t) => t.length > 0);

  const matchCategory = (token: string) => {
    const lower = token.toLowerCase();
    return categoryOptions.find((c) => c.name.toLowerCase() === lower || c.label.toLowerCase() === lower);
  };

  const deriveCategoryIds = (input: string) => {
    return splitTokens(input)
      .map((token) => {
        const match = matchCategory(token);
        if (match?.id) return match.id;
        const numeric = Number(token);
        return Number.isFinite(numeric) ? numeric : null;
      })
      .filter((id): id is number => id != null);
  };

  const formatCategoriesInput = (ids: number[]) => {
    if (!ids.length) return "";
    return ids
      .map((id) => categoryOptions.find((c) => c.id === id)?.name ?? id.toString())
      .join(`${categoryDelimiter} `);
  };

  useEffect(() => {
    let cancelled = false;
    const fetchCategories = async () => {
      try {
        const api = createApiClient(JobIndexPostsApi);
        const cats = await api.getJobCategories();
        type RawCategory = {
          id?: unknown;
          name?: string;
          category?: string;
          categoryName?: string;
          numberOfJobs?: unknown;
          jobCount?: unknown;
          count?: unknown;
        };

        const rawList = (cats as unknown as { categories?: RawCategory[]; items?: RawCategory[]; data?: RawCategory[]; })?.categories
          ?? (cats as unknown as { items?: RawCategory[]; data?: RawCategory[]; categories?: RawCategory[]; })?.items
          ?? (cats as unknown as { data?: RawCategory[]; categories?: RawCategory[]; items?: RawCategory[]; })?.data
          ?? [];

        const list = (Array.isArray(rawList) ? rawList : [])
          .map((c: RawCategory) => {
            const id = typeof c.id === "number" ? c.id : undefined;
            const name = c.name ?? c.category ?? c.categoryName ?? "";
            const countValue = c.numberOfJobs ?? c.jobCount ?? c.count;
            const count = typeof countValue === "number" ? countValue : 0;
            if (!id || !name) return null;
            return { id, name, label: `${name} (${count})`, count } satisfies CategoryOption;
          })
          .filter((v): v is CategoryOption => v !== null);

        if (!cancelled) {
          setCategoryOptions(list);
          setCategorySuggestions(list.slice(0, 8));
          if (selectedCategoryIds.length) {
            setCategoriesInput(formatCategoriesInput(selectedCategoryIds));
          }
        }
      } catch {
        if (!cancelled) {
          setCategoryOptions([]);
          setCategorySuggestions([]);
        }
      }
    };

    fetchCategories();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadJobAgent = async (profileIdValue: number, api: JobAgentApi) => {
      const existing = await api.getJobAgent({ profileId: profileIdValue });
      let link: string | null = null;
      try {
        link = await api.getJobAgentUnsubscribeLink({ profileId: profileIdValue });
      } catch {
        link = null;
      }

      if (cancelled) return;
      setMode("manage");
      setJobAgent(existing);
      setEnabled(existing?.enabled ?? true);
      setFrequency(normalizeFrequency(existing?.frequency));
      setLastSentAt(existing?.lastSentAt ? new Date(existing.lastSentAt) : null);
      setNextSendAt(existing?.nextSendAt ? new Date(existing.nextSendAt) : null);
      setLocationsInput((existing?.preferredLocations ?? []).join(", "));
      const ids = existing?.preferredCategoryIds ?? [];
      const categoryNames = existing?.preferredCategoryNames ?? [];
      setSelectedCategoryIds(ids);
      setCategoriesInput(formatCategoryInputValue(categoryNames, ids));
      setKeywordsInput((existing?.includeKeywords ?? []).join(", "));
      setUnsubscribeLink(link ?? null);
    };

    const load = async () => {
      setLoading(true);
      setError(null);
      setMessage(null);
      try {
        const profileApi = createApiClient(ProfileApi, accessToken);
        const jobAgentApi = createApiClient(JobAgentApi, accessToken);

        const profile = await profileApi.getProfileByUserId({ userId });
        if (!profile?.id) {
          throw new Error("Profilen mangler et id");
        }
        if (cancelled) return;
        setProfileId(profile.id);

        try {
          await loadJobAgent(profile.id, jobAgentApi);
        } catch (err) {
          const handled = await handleApiError(err);
          if (handled.type === "not_found") {
            if (!cancelled) {
              setMode("setup");
              setJobAgent(null);
              setEnabled(true);
              setFrequency(frequencyValues.weekly);
              setLastSentAt(null);
              setNextSendAt(null);
              setLocationsInput("");
              setSelectedCategoryIds([]);
              setCategoriesInput("");
              setKeywordsInput("");
              setUnsubscribeLink(null);
            }
            return;
          }
          throw err;
        }
      } catch (err) {
        if (!cancelled) {
          const handled = await handleApiError(err);
          setError(handled.message);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();
    return () => {
      cancelled = true;
    };
  }, [userId, accessToken]);

  const handleSave = async () => {
    if (!profileId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const api = createApiClient(JobAgentApi, accessToken);
      const parsedLocations = locationsInput.split(",").map((l) => l.trim()).filter(Boolean);
      const parsedCategoryIds = deriveCategoryIds(categoriesInput);
      const categoryIds = parsedCategoryIds.length ? parsedCategoryIds : selectedCategoryIds;
      const parsedKeywords = keywordsInput.split(",").map((k) => k.trim()).filter(Boolean);

      try {
        await api.createOrUpdateJobAgent({
          profileId,
          jobAgentUpdateRequest: {
            enabled,
            frequency,
            preferredLocations: parsedLocations,
            preferredCategoryIds: categoryIds,
            includeKeywords: parsedKeywords,
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const emptyBody = typeof message === "string" && message.toLowerCase().includes("unexpected end of json");
        if (!emptyBody) {
          throw err;
        }
      }

      const refreshed = await api.getJobAgent({ profileId });
      let link: string | null = null;
      try {
        link = await api.getJobAgentUnsubscribeLink({ profileId });
      } catch {
        link = null;
      }

      setJobAgent(refreshed);
      setEnabled(refreshed.enabled ?? enabled);
      setFrequency(normalizeFrequency(refreshed.frequency, frequency));
      setLastSentAt(refreshed.lastSentAt ? new Date(refreshed.lastSentAt) : null);
      setNextSendAt(refreshed.nextSendAt ? new Date(refreshed.nextSendAt) : null);
      setLocationsInput((refreshed.preferredLocations ?? []).join(", "));
      const refreshedIds = refreshed.preferredCategoryIds ?? selectedCategoryIds;
      const refreshedNames = refreshed.preferredCategoryNames ?? [];
      setSelectedCategoryIds(refreshedIds);
      setCategoriesInput(refreshedNames.length > 0 ? refreshedNames.join(", ") : formatCategoriesInput(refreshedIds));
      setKeywordsInput((refreshed.includeKeywords ?? []).join(", "));
      setUnsubscribeLink(link ?? null);
      setMode("manage");
      setMessage("Jobagent gemt");
    } catch (err) {
      const handled = await handleApiError(err);
      setError(handled.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCreateInitial = async () => {
    if (!profileId) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const api = createApiClient(JobAgentApi, accessToken);
      try {
        await api.createOrUpdateJobAgent({
          profileId,
          jobAgentUpdateRequest: {
            enabled: true,
            frequency: frequencyValues.weekly,
            preferredLocations: [],
            preferredCategoryIds: [],
            includeKeywords: [],
          },
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        const emptyBody = typeof message === "string" && message.toLowerCase().includes("unexpected end of json");
        if (!emptyBody) {
          throw err;
        }
      }

      const refreshed = await api.getJobAgent({ profileId });
      let link: string | null = null;
      try {
        link = await api.getJobAgentUnsubscribeLink({ profileId });
      } catch {
        link = null;
      }

      setJobAgent(refreshed);
      setEnabled(refreshed.enabled ?? true);
      setFrequency(normalizeFrequency(refreshed.frequency));
      setLastSentAt(refreshed.lastSentAt ?? null);
      setNextSendAt(refreshed.nextSendAt ?? null);
      setLocationsInput((refreshed.preferredLocations ?? []).join(", "));
      const refreshedIds = refreshed.preferredCategoryIds ?? [];
      const refreshedNames = refreshed.preferredCategoryNames ?? [];
      setSelectedCategoryIds(refreshedIds);
      setCategoriesInput(refreshedNames.length > 0 ? refreshedNames.join(", ") : formatCategoriesInput(refreshedIds));
      setKeywordsInput((refreshed.includeKeywords ?? []).join(", "));
      setUnsubscribeLink(link ?? null);
      setMode("manage");
      setMessage("Jobagent oprettet");
    } catch (err) {
      const handled = await handleApiError(err);
      setError(handled.message);
    } finally {
      setSaving(false);
    }
  };

  const getLastCategoryToken = (input: string) => {
    const parts = input.split(categoryDelimiter);
    return (parts[parts.length - 1] ?? "").trim();
  };

  const updateCategorySuggestions = (query: string) => {
    if (!categoryOptions.length) {
      setCategorySuggestions([]);
      setShowCategorySuggestions(false);
      return;
    }
    const lower = query.toLowerCase();
    const filtered = categoryOptions
      .filter((opt) => !lower || opt.name.toLowerCase().includes(lower) || opt.label.toLowerCase().includes(lower))
      .slice(0, 8);
    setCategorySuggestions(filtered);
    setShowCategorySuggestions(filtered.length > 0);
    setActiveCategoryIndex(filtered.length ? 0 : -1);
  };

  const handleCategoriesFocus = () => {
    updateCategorySuggestions(getLastCategoryToken(categoriesInput));
  };

  const handleCategoriesChange = (val: string) => {
    setCategoriesInput(val);
    setSelectedCategoryIds(deriveCategoryIds(val));
    setActiveCategoryIndex(-1);
    updateCategorySuggestions(getLastCategoryToken(val));
  };

  const handleCategorySuggestionClick = (option: CategoryOption) => {
    const rawParts = categoriesInput.split(categoryDelimiter);
    if (rawParts.length === 0) rawParts.push("");
    rawParts[rawParts.length - 1] = option.name;
    const normalized = rawParts.map((p) => p.trim()).filter((p) => p.length > 0);
    const nextInput = normalized.join(`${categoryDelimiter} `);
    setCategoriesInput(nextInput);
    const ids = deriveCategoryIds(nextInput);
    setSelectedCategoryIds(ids.length ? ids : [option.id]);
    setShowCategorySuggestions(false);
    setActiveCategoryIndex(-1);
  };

  const handleCategoriesKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showCategorySuggestions || categorySuggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveCategoryIndex((i) => (i + 1) % categorySuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveCategoryIndex((i) => (i - 1 + categorySuggestions.length) % categorySuggestions.length);
    } else if (e.key === "Enter") {
      if (activeCategoryIndex >= 0 && activeCategoryIndex < categorySuggestions.length) {
        e.preventDefault();
        handleCategorySuggestionClick(categorySuggestions[activeCategoryIndex]);
      }
    } else if (e.key === "Escape") {
      setShowCategorySuggestions(false);
    }
  };

  const formatDateTime = (value: Date | null | undefined) => {
    if (!value) return "—";
    const date = value instanceof Date ? value : new Date(value);
    return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
  };

  const inputClass = "input input-bordered w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-base-content/45";
  const selectClass = "select select-bordered w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10";
  const labelTextClass = "label-text text-sm font-semibold uppercase tracking-[0.16em] text-base-content/60";
  const frequencyLabel = frequencyOptions.find((option) => option.value === frequency)?.label ?? "Ugentligt";
  const chosenLocations = locationsInput.split(",").map((value) => value.trim()).filter(Boolean);
  const chosenKeywords = keywordsInput.split(",").map((value) => value.trim()).filter(Boolean);
  const effectiveCategoryIds = deriveCategoryIds(categoriesInput);
  const categoryCount = effectiveCategoryIds.length || selectedCategoryIds.length;

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.85rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.74),transparent_54%)]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.1fr)_300px]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              <BriefcaseIcon className="h-4 w-4" aria-hidden="true" />
              Jobagent
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                {mode === "setup" ? "Opsæt din jobagent med tydeligere kontrol" : "Administrér dine automatiske jobforslag ét sted"}
              </h2>
              <p className="max-w-3xl text-base leading-7 text-base-content/72 sm:text-lg">
                {mode === "setup"
                  ? "Opret din jobagent og vælg hurtigt, hvor ofte du vil høre fra os, og hvilke steder eller kategorier der skal prioriteres."
                  : "Justér hyppighed, lokationer, kategorier og søgeord uden at forlade profilen. Det hele er gjort lettere at skimme og finjustere."}
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Kombinér lokationer, kategorier og nøgleord for mere præcise forslag.",
                "Skift mellem aktiv og inaktiv status uden at miste dine valg.",
                "Få klar status på seneste og næste udsendelse direkte i samme visning.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Status</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Agent</p>
                <p className="mt-2 text-3xl font-semibold text-base-content">{statusLabel}</p>
                <p className="text-sm leading-6 text-base-content/65">{describeAgentStatus(mode, enabled)}</p>
              </div>
              <div className="rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Hyppighed</p>
                <p className="mt-2 text-3xl font-semibold text-base-content">{frequencyLabel}</p>
                <p className="text-sm leading-6 text-base-content/65">{mode === "setup" ? "vælg efter oprettelse" : "nuværende udsendelsesrytme"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {error && <div className="alert alert-error rounded-[1.35rem] shadow-sm text-sm">{error}</div>}
      {message && <div className="alert alert-success rounded-[1.35rem] shadow-sm text-sm">{message}</div>}

      {mode === "setup" ? (
        <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-6 shadow-lg backdrop-blur-sm sm:p-7">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-start">
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Start jobagent</p>
              <h3 className="text-2xl font-semibold tracking-tight text-base-content">Opret den første version af din jobagent</h3>
              <p className="text-base leading-7 text-base-content/68">
                Vi opretter agenten med en standardhyppighed, hvorefter du kan finjustere alt fra kategorier til nøgleord direkte i panelet.
              </p>
            </div>
            <div className="rounded-[1.35rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
              <button
                type="button"
                className="btn btn-primary min-h-12 w-full rounded-2xl px-6 shadow-lg shadow-primary/20"
                onClick={handleCreateInitial}
                disabled={loading || saving || !profileId}
              >
                {saving ? "Opretter..." : "Opret jobagent"}
              </button>
              {loading && <div className="mt-3 text-sm text-base-content/55">Henter data...</div>}
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(280px,0.95fr)]">
          <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <div className="grid gap-5">
              <div className="rounded-[1.35rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <label className="label flex-col items-start gap-3">
                  <span className={labelTextClass}>Aktiver jobagent</span>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="toggle toggle-primary"
                      checked={enabled}
                      onChange={(e) => setEnabled(e.target.checked)}
                      disabled={loading || saving}
                    />
                    <span className="text-sm leading-6 text-base-content/68">Slå automatiske jobforslag til eller fra uden at miste dine filtre.</span>
                  </div>
                </label>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <div className="form-control gap-2">
                  <label className="label p-0" htmlFor={frequencySelectId}><span className={labelTextClass}>Hyppighed</span></label>
                  <select
                    id={frequencySelectId}
                    className={selectClass}
                    value={frequency}
                    onChange={(e) => setFrequency(normalizeFrequency(Number(e.target.value)))}
                    disabled={loading || saving}
                  >
                    {frequencyOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>

                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Nuværende valg</p>
                  <p className="mt-2 text-xl font-semibold text-base-content">{frequencyLabel}</p>
                  <p className="text-sm leading-6 text-base-content/65">Vi bruger denne rytme til næste udsendelse.</p>
                </div>
              </div>

              <div className="form-control gap-2">
                <label className="label p-0" htmlFor={locationsInputId}><span className={labelTextClass}>Foretrukne lokationer</span></label>
                <LocationTypeahead
                  value={locationsInput}
                  onChange={setLocationsInput}
                  placeholder="fx København, Aarhus"
                  className={inputClass}
                  inputProps={{
                    id: locationsInputId,
                    disabled: loading || saving,
                    "aria-label": "Foretrukne lokationer",
                  }}
                  allowCommaSeparated
                />
                <p className="text-sm leading-6 text-base-content/60">Tilføj flere steder med komma for at gøre søgeresultaterne bredere.</p>
              </div>

              <div className="form-control gap-2">
                <label className="label p-0" htmlFor={categoriesInputId}><span className={labelTextClass}>Kategorier</span></label>
                <div className="relative">
                  <input
                    type="text"
                    className={inputClass}
                    placeholder="Start skriv for at vælge – understøtter komma"
                    id={categoriesInputId}
                    value={categoriesInput}
                    onChange={(e) => handleCategoriesChange(e.target.value)}
                    onFocus={handleCategoriesFocus}
                    onKeyDown={handleCategoriesKeyDown}
                    onBlur={() => setTimeout(() => setShowCategorySuggestions(false), 100)}
                    disabled={loading || saving}
                    aria-label="Kategorier"
                  />
                  {showCategorySuggestions && categorySuggestions.length > 0 && (
                    <ul className="absolute left-0 top-full z-30 mt-2 max-h-48 w-full overflow-y-auto rounded-[1.1rem] border border-base-300/70 bg-base-100 shadow-lg">
                      {categorySuggestions.map((cat, idx) => (
                        <li key={cat.id} className="border-b border-base-200 last:border-b-0">
                          <button
                            type="button"
                            className={`w-full border-0 px-3 py-3 text-left ${idx === activeCategoryIndex ? "bg-primary text-primary-content" : "bg-base-100 hover:bg-base-200"}`}
                            onMouseDown={(e) => { e.preventDefault(); handleCategorySuggestionClick(cat); }}
                            onClick={() => handleCategorySuggestionClick(cat)}
                          >
                            <span className="flex items-center justify-between gap-2">
                              <span>{cat.name}</span>
                              <span className="text-xs opacity-70">{cat.count}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <span className="text-sm leading-6 text-base-content/60">Skriv flere kategorier adskilt med komma. Matcher automatisk navne eller ID'er.</span>
              </div>

              <div className="form-control gap-2">
                <label className="label p-0" htmlFor={keywordsInputId}><span className={labelTextClass}>Søgeord der skal med</span></label>
                <input
                  type="text"
                  className={inputClass}
                  placeholder="fx React, .NET, marketing"
                  id={keywordsInputId}
                  value={keywordsInput}
                  onChange={(e) => setKeywordsInput(e.target.value)}
                  disabled={loading || saving}
                />
              </div>

              <button
                type="button"
                className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20"
                onClick={handleSave}
                disabled={loading || saving || !profileId}
              >
                {saving ? "Gemmer..." : "Gem jobagent"}
              </button>

              {loading && <div className="text-sm text-base-content/55">Henter jobagent...</div>}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Opsummering</p>
              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-[1.2rem] border border-base-300/70 bg-base-200/35 px-4 py-3 shadow-sm">
                  <MapPinIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-base-content">Lokationer</p>
                    <p className="text-sm leading-6 text-base-content/68">{chosenLocations.length ? chosenLocations.join(", ") : "Ingen lokationer valgt endnu"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.2rem] border border-base-300/70 bg-base-200/35 px-4 py-3 shadow-sm">
                  <TagIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-base-content">Kategorier</p>
                    <p className="text-sm leading-6 text-base-content/68">{categoryCount ? `${categoryCount} valgt` : "Ingen kategorier valgt endnu"}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.2rem] border border-base-300/70 bg-base-200/35 px-4 py-3 shadow-sm">
                  <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="text-sm font-semibold text-base-content">Søgeord</p>
                    <p className="text-sm leading-6 text-base-content/68">{chosenKeywords.length ? chosenKeywords.join(", ") : "Ingen søgeord valgt endnu"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Udsendelser</p>
              <div className="mt-4 space-y-3 text-sm text-base-content/68">
                <div className="flex items-start gap-3 rounded-[1.2rem] border border-base-300/70 bg-base-200/35 px-4 py-3 shadow-sm">
                  <ClockIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-base-content">Sidst sendt</p>
                    <p>{formatDateTime(lastSentAt ?? jobAgent?.lastSentAt ?? null)}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 rounded-[1.2rem] border border-base-300/70 bg-base-200/35 px-4 py-3 shadow-sm">
                  <EnvelopeIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <p className="font-semibold text-base-content">Næste udsendelse</p>
                    <p>{formatDateTime(nextSendAt ?? jobAgent?.nextSendAt ?? null)}</p>
                  </div>
                </div>
              </div>

              {enabled && unsubscribeLink && (
                <div className="mt-5 border-t border-base-300/70 pt-5">
                  <a
                    className="btn btn-ghost min-h-11 rounded-2xl border border-error/20 bg-error/10 px-5 text-error hover:bg-error/15"
                    href={unsubscribeLink}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Afmeld jobagent
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobAgentCard;
