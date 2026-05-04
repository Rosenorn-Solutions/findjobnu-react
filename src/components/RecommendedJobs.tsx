import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.shared";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import JobList from "./JobList";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient } from "../helpers/ApiFactory";
import SearchForm, { type CategoryOption } from "./SearchForm";
import { toDateFromInput } from "../helpers/date";
import AnimatedCounter from "./AnimatedCounter";
import { AdjustmentsHorizontalIcon, SparklesIcon } from "@heroicons/react/24/outline";

interface Props {
  userId: string;
  renderSearchForm?: boolean;
  searchParams?: {
    searchTerms?: string[];
    locations?: string[];
    categoryKeys?: string[];
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryKey?: string;
    postedAfter?: string;
    postedBefore?: string;
  } | null;
  categoriesOverride?: CategoryOption[];
  flushTop?: boolean;
  onTotalCountChange?: (count: number) => void;
}

const PAGE_SIZE = 10;

const RecommendedJobs: React.FC<Props> = ({ userId, renderSearchForm = true, searchParams, categoriesOverride, flushTop = false, onTotalCountChange }) => {
  const [jobs, setJobs] = useState<JobIndexPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [categories, setCategories] = useState<CategoryOption[]>(categoriesOverride ?? []);
  const [lastSearchParams, setLastSearchParams] = useState<{
    searchTerms?: string[];
    locations?: string[];
    categoryKeys?: string[];
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryKey?: string;
    postedAfter?: string;
    postedBefore?: string;
  } | null>(searchParams ?? null);

  const { user } = useUser();
  const token = user?.accessToken;

  useEffect(() => {
    if (categoriesOverride) return;
    const jobApi = createApiClient(JobIndexPostsApi, token);

    const fetchCategories = async () => {
      try {
        const cats = await jobApi.getJobCategories();
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
            const key = (c as unknown as { categoryKey?: string }).categoryKey ?? undefined;
            const name = (c as unknown as { categoryName?: string }).categoryName ?? c.name ?? c.category ?? "";
            const countValue = c.numberOfJobs ?? c.jobCount ?? c.count;
            const count = typeof countValue === "number" ? countValue : 0;
            if (!name) return null;
            return { id, key, name, label: `${name} (${count})`, count } satisfies CategoryOption;
          }) as Array<CategoryOption | null>;

        const filtered = list.filter((v): v is CategoryOption => v !== null);
        setCategories(filtered);
      } catch {
        setCategories([]);
      }
    };

    fetchCategories();
  }, [token, categoriesOverride]);

  useEffect(() => {
    if (searchParams) {
      setLastSearchParams(searchParams);
      setCurrentPage(1);
    }
  }, [searchParams]);

  useEffect(() => {
    const jobApi = createApiClient(JobIndexPostsApi, token);
    const fetchRecommended = async () => {
      setLoading(true);
      setError(null);
      try {
        const postedAfter = lastSearchParams?.postedAfter ? toDateFromInput(lastSearchParams.postedAfter) ?? undefined : undefined;
        const postedBefore = lastSearchParams?.postedBefore ? toDateFromInput(lastSearchParams.postedBefore) ?? undefined : undefined;

        const searchTerms = lastSearchParams?.searchTerms ?? (lastSearchParams?.searchTerm ? [lastSearchParams.searchTerm.trim()].filter(Boolean) : undefined);
        const locations = lastSearchParams?.locations ?? (lastSearchParams?.location ? [lastSearchParams.location.trim()].filter(Boolean) : undefined);
        const categoryKeys = lastSearchParams?.categoryKeys ?? (lastSearchParams?.categoryKey ? [lastSearchParams.categoryKey] : undefined);

        const response = await jobApi.getRecommendedJobsForUser({
          searchTerms,
          locations,
          categoryKeys,
          postedAfter,
          postedBefore,
          page: currentPage,
          pageSize: PAGE_SIZE,
        });
        setJobs(response?.items?.filter(Boolean) ?? []);
        const count = response?.totalCount ?? 0;
        setTotalCount(count);
        onTotalCountChange?.(count);
      } catch (e) {
        const handled = await handleApiError(e);
        setError(handled.message);
      }
      setLoading(false);
    };

    fetchRecommended();
  }, [userId, currentPage, token, lastSearchParams, onTotalCountChange]);

  const handleSearch = (params: {
    searchTerms?: string[];
    locations?: string[];
    categoryKeys?: string[];
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryKey?: string;
    postedAfter?: string;
    postedBefore?: string;
  }) => {
    setCurrentPage(1);
    setLastSearchParams(params);
  };

  const searchTerms = lastSearchParams?.searchTerms ?? (lastSearchParams?.searchTerm ? [lastSearchParams.searchTerm.trim()].filter(Boolean) : []);
  const locations = lastSearchParams?.locations ?? (lastSearchParams?.location ? [lastSearchParams.location.trim()].filter(Boolean) : []);
  const categoryKeys = lastSearchParams?.categoryKeys ?? (lastSearchParams?.categoryKey ? [lastSearchParams.categoryKey] : []);
  const categoryLabels = categoryKeys
    .map((key) => categories.find((category) => category.key === key)?.name)
    .filter((value): value is string => Boolean(value));
  const filterTokens = [
    ...searchTerms.map((value) => `Søgeord: ${value}`),
    ...locations.map((value) => `Lokation: ${value}`),
    ...categoryLabels.map((value) => `Kategori: ${value}`),
    ...(lastSearchParams?.postedAfter ? [`Fra ${lastSearchParams.postedAfter}`] : []),
    ...(lastSearchParams?.postedBefore ? [`Til ${lastSearchParams.postedBefore}`] : []),
  ];
  const previewFilters = filterTokens.slice(0, 4);
  const hiddenFilterCount = Math.max(0, filterTokens.length - previewFilters.length);
  const activeSignalCount = searchTerms.length + locations.length + categoryKeys.length + (lastSearchParams?.postedAfter ? 1 : 0) + (lastSearchParams?.postedBefore ? 1 : 0);

  return (
    <div className={`${flushTop ? "" : "mt-8"} space-y-6`}>
      <section className="rounded-[1.9rem] border border-secondary/20 bg-gradient-to-br from-base-100 via-secondary/5 to-primary/10 p-5 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.52)] sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <span className="inline-flex items-center gap-2 rounded-full border border-secondary/20 bg-secondary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-secondary">
              <SparklesIcon className="h-4 w-4" aria-hidden="true" />
              Anbefalet til dig
            </span>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Job, der passer bedre til din profil</h2>
              <p className="max-w-2xl text-sm leading-6 text-base-content/70 sm:text-base">
                Anbefalingerne tager udgangspunkt i din profil og de filtre, du bruger lige nu. Resultatet er en mere fokuseret liste, som er hurtigere at skimme på både mobil og desktop.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
              {previewFilters.length > 0 ? (
                previewFilters.map((token) => (
                  <span key={token} className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">
                    {token}
                  </span>
                ))
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">
                  Baseret på din profil og tidligere valg
                </span>
              )}
              {hiddenFilterCount > 0 && (
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">
                  +{hiddenFilterCount} flere filtre
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:min-w-[18rem]">
            <div className="rounded-[1.25rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Anbefalinger</p>
              <p className="mt-2 text-2xl font-semibold text-base-content">{loading ? "..." : <AnimatedCounter value={totalCount} />}</p>
              <p className="text-xs text-base-content/60">{loading ? "opdaterer listen" : "matchende opslag lige nu"}</p>
            </div>

            <div className="rounded-[1.25rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
              <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Signaler</p>
              <p className="mt-2 text-2xl font-semibold text-base-content">{activeSignalCount}</p>
              <p className="text-xs text-base-content/60">aktive præferencer i spil</p>
            </div>
          </div>
        </div>
      </section>

      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="order-2 min-w-0 flex-1 lg:order-1">
          {error && (
            <div className="mb-4 rounded-[1.25rem] border border-error/20 bg-error/10 px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <JobList
            jobs={jobs}
            loading={loading}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
            mode="recommended"
          />
        </div>

        {renderSearchForm && (
          <div className="order-1 w-full shrink-0 lg:order-2 lg:w-[22rem]">
            <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/85 p-4 shadow-xl lg:sticky lg:top-24">
              <div className="mb-4 space-y-2">
                <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">
                  <AdjustmentsHorizontalIcon className="h-4 w-4" aria-hidden="true" />
                  Finjuster anbefalinger
                </p>
                <h3 className="text-lg font-semibold text-base-content">Skærp matchningen</h3>
                <p className="text-sm leading-6 text-base-content/65">Tilføj filtre for at gøre anbefalingerne mere relevante uden at miste overblikket.</p>
              </div>

              <div className="rounded-[1.5rem] border border-base-300/70 bg-gradient-to-br from-base-100 to-primary/5 p-4 shadow-sm">
                <SearchForm onSearch={handleSearch} categories={categories} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedJobs;
