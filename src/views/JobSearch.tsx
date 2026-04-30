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
import AnimatedCounter from "../components/AnimatedCounter";

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
    searchTerms?: string[];
    locations?: string[];
    categoryIds?: number[];
    searchTerm?: string;
    location?: string;
    locationSlug?: string;
    categoryId?: number;
    postedAfter?: string;
    postedBefore?: string;
  } | null>(null);
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
  } | null>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const hasUser = userId.length > 0;
  const toggleTooltip = hasUser ? undefined : "Log ind for at se anbefalede jobs";

  const setPanelQueryParam = (panel: "search" | "recommended") => {
    const next = new URLSearchParams(searchParams);
    next.set("panel", panel);
    setSearchParams(next, { replace: true });
  };

  const switchToSearch = () => {
    setPanelQueryParam("search");
    setActivePanel("search");
    setRecommendedSearchParams(null);
    setCurrentPage(1);
    setTotalCount(0);
    setFormKey((k) => k + 1);
    if (lastSearchParams) {
      handleSearch(lastSearchParams, 1);
    } else {
      fetchAllJobs(1);
    }
  };

  const switchToRecommended = () => {
    setPanelQueryParam("recommended");
    setActivePanel("recommended");
    setRecommendedSearchParams(null);
    setCurrentPage(1);
    setTotalCount(0);
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
    params: { 
      searchTerms?: string[];
      locations?: string[];
      categoryIds?: number[];
      searchTerm?: string; 
      location?: string; 
      locationSlug?: string; 
      categoryId?: number; 
      postedAfter?: string; 
      postedBefore?: string 
    },
    page = 1
  ) => {
    setLoading(true);
    try {
      const postedAfter = params.postedAfter ? toDateFromInput(params.postedAfter) ?? undefined : undefined;
      const postedBefore = params.postedBefore ? toDateFromInput(params.postedBefore) ?? undefined : undefined;
      
      // Use new array-based parameters, falling back to single values for compatibility
      const searchTerms = params.searchTerms ?? (params.searchTerm ? [params.searchTerm] : undefined);
      const locations = params.locations ?? (params.location ? [normalizeLocation(params.location)].filter(Boolean) as string[] : undefined);
      const categoryIds = params.categoryIds ?? (params.categoryId ? [params.categoryId] : undefined);

      const data = await api.getJobPostsBySearch({
        searchTerms,
        locations,
        categoryIds,
        page,
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
      const nextParams = lastSearchParams ? { ...lastSearchParams, categoryId } : { categoryId };
      handleSearch(nextParams, 1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const searchPanelButtonClass = activePanel === "search"
    ? "btn-primary shadow-lg shadow-primary/20"
    : "btn-ghost border border-base-300/80 bg-base-100/70";

  let recommendedPanelButtonClass = "btn-ghost border border-base-300/80 bg-base-100/70";
  if (hasUser === false) {
    recommendedPanelButtonClass = "border border-base-200 bg-base-200/70 text-base-content/40";
  } else if (activePanel === "recommended") {
    recommendedPanelButtonClass = "btn-primary shadow-lg shadow-primary/20";
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 prose prose-neutral">
      <h1 className="sr-only">Jobsøgning</h1>
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
      <div className="flex flex-col gap-6">
        <section className="not-prose relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_52%)]" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative flex flex-col gap-6 p-5 sm:p-7 lg:p-8">
            <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                  <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                  Jobsøgning
                </div>

                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                    Find dit næste job med et bedre overblik
                  </h2>
                  <p className="max-w-2xl text-sm leading-6 text-base-content/70 sm:text-base">
                    Kombinér titel, kategori, dato og lokation i en samlet søgning. Layoutet er gjort bredere, tydeligere og nemmere at bruge på mobilen.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2 text-sm text-base-content/70">
                  {!loading && totalCount > 0 && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">
                      <span className="text-base font-semibold text-base-content">
                        <AnimatedCounter value={totalCount} />
                      </span>
                      <span>resultater klar</span>
                    </span>
                  )}
                  {loading && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/70 px-3 py-1.5 shadow-sm">
                      Opdaterer resultater...
                    </span>
                  )}
                  <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/70 px-3 py-1.5 shadow-sm">
                    Flere filtre i samme søgning
                  </span>
                  <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/70 px-3 py-1.5 shadow-sm">
                    Hurtig på mobil, præcis på desktop
                  </span>
                </div>
              </div>

              <div className="w-full rounded-[1.5rem] border border-base-300/70 bg-base-100/80 p-4 shadow-lg backdrop-blur sm:w-auto sm:min-w-[19rem]">
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-base-content/45">Visning</p>
                    <p className="mt-1 text-sm text-base-content/70">Skift mellem jobsøgning og anbefalinger uden at miste overblikket.</p>
                  </div>
                  <SparklesIcon className="h-5 w-5 text-secondary" aria-hidden="true" />
                </div>

                <div className="flex flex-col gap-2 sm:flex-row">
                  <button
                    type="button"
                    className={`btn min-h-11 rounded-2xl px-4 ${searchPanelButtonClass}`}
                    onClick={switchToSearch}
                    aria-label="Vis jobresultater"
                  >
                    <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />
                    Jobsøgning
                  </button>

                  <div className={`${toggleTooltip ? "tooltip tooltip-bottom lg:tooltip-left" : ""} w-full sm:w-auto`} data-tip={toggleTooltip}>
                    <button
                      type="button"
                      className={`btn min-h-11 w-full rounded-2xl px-4 ${recommendedPanelButtonClass}`}
                      onClick={switchToRecommended}
                      disabled={hasUser === false}
                      aria-label="Vis anbefalinger"
                    >
                      <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                      Anbefalede jobs
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/60 bg-base-100/80 p-4 shadow-inner shadow-base-content/5 backdrop-blur-xl sm:p-6">
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
        </section>

        <div className="min-w-0">
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
              onTotalCountChange={setTotalCount}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default JobSearch;
