import React, { useEffect, useState } from "react";
import { useUser } from "../context/UserContext.shared";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import JobList from "./JobList";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient } from "../helpers/ApiFactory";
import SearchForm, { type CategoryOption } from "./SearchForm";
import { toDateFromInput } from "../helpers/date";

interface Props {
  userId: string;
  renderSearchForm?: boolean;
  searchParams?: {
    searchTerms?: string[];
    locations?: string[];
    categoryIds?: number[];
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
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
    categoryIds?: number[];
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
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
            const name = c.name ?? c.category ?? c.categoryName ?? "";
            const countValue = c.numberOfJobs ?? c.jobCount ?? c.count;
            const count = typeof countValue === "number" ? countValue : 0;
            if (!id || !name) return null;
            return { id, name, label: `${name} (${count})`, count } satisfies CategoryOption;
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

        // Use new array-based parameters, falling back to single values for compatibility
        const searchTerms = lastSearchParams?.searchTerms ?? (lastSearchParams?.searchTerm ? [lastSearchParams.searchTerm.trim()].filter(Boolean) : undefined);
        const locations = lastSearchParams?.locations ?? (lastSearchParams?.location ? [lastSearchParams.location.trim()].filter(Boolean) : undefined);
        const categoryIds = lastSearchParams?.categoryIds ?? (lastSearchParams?.categoryId ? [lastSearchParams.categoryId] : undefined);

        const response = await jobApi.getRecommendedJobsForUser({
          searchTerms,
          locations,
          categoryIds,
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
    categoryIds?: number[];
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
    postedAfter?: string;
    postedBefore?: string;
  }) => {
    setCurrentPage(1);
    setLastSearchParams(params);
  };

  return (
    <div className={flushTop ? "" : "mt-8"}>
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="order-2 lg:order-1 flex-1 min-w-0">
          <JobList
            jobs={jobs}
            loading={loading}
            currentPage={currentPage}
            pageSize={PAGE_SIZE}
            totalCount={totalCount}
            onPageChange={setCurrentPage}
          />
          {error && <div className="text-center py-8 text-red-500">{error}</div>}
        </div>

        {renderSearchForm && (
          <div className="order-1 lg:order-2 shrink-0 w-full lg:w-fit">
            <div className="card bg-linear-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/20 lg:sticky lg:top-24 w-full transition-all hover:shadow-2xl hover:-translate-y-1">
              <div className="p-4">
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
