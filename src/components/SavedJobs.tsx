import React, { useEffect, useState } from "react";
import { BookmarkSquareIcon, CheckCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import JobList from "./JobList";
import { handleApiError } from "../helpers/ErrorHelper";
import { createApiClient } from "../helpers/ApiFactory";

interface Props {
  userId: string;
}

const PAGE_SIZE = 10;

const SavedJobs: React.FC<Props> = ({ userId }) => {
  const [jobs, setJobs] = useState<JobIndexPostResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { user } = useUser();
  const token = user?.accessToken;

  useEffect(() => {
    const jobApi = createApiClient(JobIndexPostsApi, token);
    const fetchSavedJobs = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await jobApi.getSavedJobPostsByUser({ page: currentPage });
        setJobs(response?.items?.filter(Boolean) ?? []);
        setTotalCount(response?.totalCount ?? 0);
      } catch (e) {
        handleApiError(e).then((errorMessage) => {
          setError(errorMessage.message);
        });
      }
      setLoading(false);
    };
    fetchSavedJobs();
  }, [userId, currentPage, token]);

  const savedJobsCount = totalCount || jobs.length;

  if (jobs.length === 0 && !loading) {
    return (
      <div className="space-y-6">
        <section className="relative overflow-hidden rounded-[1.85rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.74),transparent_54%)]" />
          <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.1fr)_300px]">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                <BookmarkSquareIcon className="h-4 w-4" aria-hidden="true" />
                Gemte job
              </div>

              <div className="space-y-3">
                <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                  Dine gemte job venter bare på næste skridt
                </h2>
                <p className="max-w-3xl text-base leading-7 text-base-content/72 sm:text-lg">
                  Når du gemmer job, samler vi dem her, så du hurtigt kan vende tilbage til dem, du vil følge op på senere.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  "Brug gemte job som din korte liste over relevante muligheder.",
                  "Vend tilbage til opslagene uden at lede efter dem igen.",
                  "Hold profilen opdateret for at gøre dine vurderinger hurtigere.",
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
              <div className="mt-4 rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Gemte opslag</p>
                <p className="mt-2 text-3xl font-semibold text-base-content">0</p>
                <p className="text-sm leading-6 text-base-content/65">Du har endnu ikke gemt nogen jobopslag</p>
              </div>
            </div>
          </div>
        </section>

        <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/82 p-6 text-center shadow-lg backdrop-blur-sm sm:p-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/15 bg-primary/10 text-primary shadow-sm">
            <SparklesIcon className="h-7 w-7" aria-hidden="true" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-base-content">Ingen gemte jobs fundet</h3>
          <p className="mx-auto mt-3 max-w-2xl text-base leading-7 text-base-content/68">
            Gem opslag direkte fra søgeresultaterne, så de dukker op her med det samme næste gang du vil sammenligne muligheder.
          </p>
        </div>

        {error && <div className="rounded-[1.35rem] border border-error/25 bg-error/10 px-4 py-3 text-sm text-error shadow-sm">{error}</div>}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.85rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.74),transparent_54%)]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.1fr)_300px]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              <BookmarkSquareIcon className="h-4 w-4" aria-hidden="true" />
              Gemte job
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                Hold styr på de job du vil vende tilbage til
              </h2>
              <p className="max-w-3xl text-base leading-7 text-base-content/72 sm:text-lg">
                Gemte opslag samles her med samme rolige overblik som resten af profilen, så du hurtigere kan sammenligne og følge op.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "Bevar fokus på de opslag, du allerede har vurderet som relevante.",
                "Brug listen som din personlige shortlist, når du vil ansøge senere.",
                "Kombinér gemte opslag med profilopdateringer for bedre prioritering.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Listeoverblik</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Gemte opslag</p>
                <p className="mt-2 text-3xl font-semibold text-base-content">{savedJobsCount}</p>
                <p className="text-sm leading-6 text-base-content/65">samlet i din shortlist</p>
              </div>
              <div className="rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Side</p>
                <p className="mt-2 text-3xl font-semibold text-base-content">{currentPage}</p>
                <p className="text-sm leading-6 text-base-content/65">viser op til {PAGE_SIZE} opslag ad gangen</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <JobList
        jobs={jobs}
        loading={loading}
        currentPage={currentPage}
        pageSize={PAGE_SIZE}
        totalCount={totalCount}
        onPageChange={setCurrentPage}
      />
      {error && <div className="rounded-[1.35rem] border border-error/25 bg-error/10 px-4 py-3 text-sm text-error shadow-sm">{error}</div>}
    </div>
  );
};

export default SavedJobs;