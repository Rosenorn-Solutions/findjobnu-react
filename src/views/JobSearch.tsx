import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { JobIndexPostsApi } from "../findjobnu-api/";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import SearchForm, { type CategoryOption } from "../components/SearchForm";
import JobList from "../components/JobList";
import RecommendedJobs from "../components/RecommendedJobs";
import { SparklesIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import { toDateFromInput } from "../helpers/date";
import Seo from "../components/Seo";

// Reuse the API client instantiation
const api = createApiClient(JobIndexPostsApi);

const normalizeLocation = (value?: string | null) => {
  if (!value) return undefined;
  const trimmed = value.trim();
  return trimmed || undefined;
};

const JobSearch: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId ?? "";
  const [jobs, setJobs] = useState<JobIndexPostResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [activePanel, setActivePanel] = useState<"search" | "recommended">("search");
  const [formKey, setFormKey] = useState(0);
  const [recommendedSearchParams, setRecommendedSearchParams] = useState<{
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
    postedAfter?: string;
    postedBefore?: string;
  } | null>(null);
  const [lastSearchParams, setLastSearchParams] = useState<{
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
    postedAfter?: string;
    postedBefore?: string;
  } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const toggleTooltip = userId ? undefined : "Log ind for at se anbefalede jobs";

  const setPanelQueryParam = (panel: "search" | "recommended") => {
    const next = new URLSearchParams(searchParams);
    next.set("panel", panel);
    setSearchParams(next, { replace: true });
  };

  const switchToSearch = () => {
    setPanelQueryParam("search");
    setActivePanel("search");
    setRecommendedSearchParams(null);
    setLastSearchParams(null);
    setCurrentPage(1);
    setFormKey((k) => k + 1);
  };

  const switchToRecommended = () => {
    setPanelQueryParam("recommended");
    setActivePanel("recommended");
    setLastSearchParams(null);
    setRecommendedSearchParams(null);
    setCurrentPage(1);
    setFormKey((k) => k + 1);
  };

  const parseCategoryFromQuery = () => {
    const raw = searchParams.get("category") ?? searchParams.get("categoryId");
    if (!raw) return undefined;
    const asNumber = Number(raw);
    return Number.isFinite(asNumber) ? asNumber : undefined;
  };

  const parsePanelFromQuery = () => {
    const panel = searchParams.get("panel");
    return panel === "recommended" ? "recommended" : "search";
  };

  useEffect(() => {
    const parsedPanel = parsePanelFromQuery();
    const allowedPanel = parsedPanel === "recommended" && !userId ? "search" : parsedPanel;
    setActivePanel((prev) => (prev === allowedPanel ? prev : allowedPanel));
    if (parsedPanel !== allowedPanel) {
      const next = new URLSearchParams(searchParams);
      next.set("panel", allowedPanel);
      setSearchParams(next, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, userId]);

  const fetchAllJobs = async (page = 1) => {
    setLoading(true);
    try {
      const data = await api.getAllJobPosts({ page, pageSize });
      setJobs(data?.items ?? []);
      setTotalCount(data?.totalCount ?? 0);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const cats = await api.getJobCategories();
      const rawList = (cats as unknown as { categories?: RawCategory[]; items?: RawCategory[]; data?: RawCategory[]; })?.categories
        ?? (cats as unknown as { items?: RawCategory[]; data?: RawCategory[]; categories?: RawCategory[]; })?.items
        ?? (cats as unknown as { data?: RawCategory[]; categories?: RawCategory[]; items?: RawCategory[]; })?.data
        ?? [];
      type RawCategory = {
        id?: unknown;
        name?: string;
        category?: string;
        categoryName?: string;
        numberOfJobs?: unknown;
        jobCount?: unknown;
        count?: unknown;
      };

      const list = (Array.isArray(rawList) ? rawList : [])
        .map((c: RawCategory) => {
          const id = typeof c.id === "number" ? c.id : undefined;
          const name = c.name ?? c.category ?? c.categoryName ?? "";
          const countValue = c.numberOfJobs ?? c.jobCount ?? c.count;
          const count = typeof countValue === "number" ? countValue : 0;
          if (!id || !name) return null;
          return {
            id,
            name,
            label: `${name} (${count})`,
            count,
          } satisfies CategoryOption;
        }) as Array<CategoryOption | null>;

      const filtered = list.filter((v): v is CategoryOption => v !== null);
      setCategories(filtered);
    } catch {
      setCategories([]);
    }
  };

  const handleSearch = async (
    params: { searchTerm?: string; location?: string; locationSlug?: string; categoryId?: number; postedAfter?: string; postedBefore?: string },
    page = 1
  ) => {
    setLoading(true);
    try {
      const locationFromInput = params.location?.trim();
      const locationNormalized = normalizeLocation(locationFromInput);
      const postedAfter = params.postedAfter ? toDateFromInput(params.postedAfter) ?? undefined : undefined;
      const postedBefore = params.postedBefore ? toDateFromInput(params.postedBefore) ?? undefined : undefined;
      const data = await api.getJobPostsBySearch({
        ...params,
        categoryId: params.categoryId ?? undefined,
        page,
        location: locationNormalized,
        pageSize,
        postedAfter,
        postedBefore,
      });
      setJobs(data?.items ?? []);
      setTotalCount(data?.totalCount ?? 0);
      setCurrentPage(page);
      setLastSearchParams(params);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    if (lastSearchParams) {
      handleSearch(lastSearchParams, page);
    } else {
      fetchAllJobs(page);
    }
  };

  useEffect(() => {
    const categoryId = parseCategoryFromQuery();
    fetchCategories();
    if (categoryId == null) {
      fetchAllJobs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const categoryId = parseCategoryFromQuery();
    const lastCategory = lastSearchParams?.categoryId;
    if (categoryId != null && categoryId !== lastCategory) {
      handleSearch({ ...(lastSearchParams ?? {}), categoryId }, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  return (
    <div className="container max-w-7xl mx-auto px-4">
      <Seo
        title="Jobsøgning – Søg i 1000+ danske jobopslag | FindJob.nu"
        description="Find dit næste job blandt tusindvis af aktuelle stillinger. Filtrér på branche, lokation og jobtitel. Gratis at bruge."
        path="/jobsearch"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Jobsøgning",
            url: "https://findjob.nu/jobsearch",
            description: "Søg blandt danske jobopslag, filtrér på kategori og geografi.",
          },
          {
            "@context": "https://schema.org",
            "@type": "SearchAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: "https://findjob.nu/jobsearch?searchTerm={search_term}"
            },
            "query-input": "required name=search_term"
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              {
                "@type": "ListItem",
                position: 1,
                name: "Forside",
                item: "https://findjob.nu/"
              },
              {
                "@type": "ListItem",
                position: 2,
                name: "Jobsøgning",
                item: "https://findjob.nu/jobsearch"
              }
            ]
          }
        ]}
      />
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="order-2 lg:order-1 flex-1 min-w-0">
          {activePanel === "search" ? (
            <JobList
              jobs={jobs}
              loading={loading}
              currentPage={currentPage}
              pageSize={pageSize}
              totalCount={totalCount}
              onPageChange={handlePageChange}
            />
          ) : (
            <RecommendedJobs
              userId={userId}
              renderSearchForm={false}
              searchParams={recommendedSearchParams}
              categoriesOverride={categories}
              flushTop
            />
          )}
        </div>

        <div className="order-1 lg:order-2 shrink-0 w-full lg:w-72 max-w-xs self-start flex flex-col gap-4">
          <div className="bg-base-100/95 border border-base-200 rounded-box shadow-sm p-3 flex items-center justify-between gap-3">
            <div className="flex flex-col text-sm text-base-content/80">
              <span className="font-semibold">Anbefalede jobs</span>
              <span className="text-xs text-base-content/60">Slå til for at se anbefalinger</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-2 text-xs text-base-content/70">
                <span className="inline-flex items-center gap-1">
                  <MagnifyingGlassIcon className="w-4 h-4" aria-hidden="true" />
                  Jobsøgning
                </span>
                <span>•</span>
                <span className="inline-flex items-center gap-1">
                  <SparklesIcon className="w-4 h-4" aria-hidden="true" />
                  Anbefalet
                </span>
              </div>
              <div className={toggleTooltip ? "tooltip tooltip-left" : undefined} data-tip={toggleTooltip}>
                <label className="label cursor-pointer gap-2" htmlFor="jobsearch-panel-toggle">
                  <input
                    id="jobsearch-panel-toggle"
                    type="checkbox"
                    className="toggle toggle-primary toggle-sm"
                    checked={activePanel === "recommended"}
                    onChange={(e) => (e.target.checked ? switchToRecommended() : switchToSearch())}
                    disabled={!userId}
                    aria-label="Skift mellem jobsøgning og anbefalede jobs"
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 w-full lg:w-72 max-w-xs">
            <div className="card bg-base-100 shadow-xl w-full lg:w-72 max-w-xs">
              <div className="p-4">
                <SearchForm
                  key={`search-form-${formKey}-${activePanel}`}
                  onSearch={(params) => {
                    if (activePanel === "search") {
                      setCurrentPage(1);
                      setLastSearchParams(params);
                      handleSearch(params, 1);
                    } else {
                      setRecommendedSearchParams(params);
                    }
                  }}
                  categories={categories}
                  queryCategory={parseCategoryFromQuery()?.toString() ?? undefined}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
