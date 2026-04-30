import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import Paging from "./Paging";
import { ProfileApi, JobIndexPostsApi } from "../findjobnu-api";
import { handleApiError } from "../helpers/ErrorHelper";
import { useUser } from "../context/UserContext.shared";
import { createApiClient, getApiBaseUrl } from "../helpers/ApiFactory";
import { sanitizeExternalUrl } from "../helpers/url";
import JobListSkeleton from "./JobListSkeleton";
import AdWrapper from "./AdWrapper";
import {
  MapPinIcon,
  BuildingOffice2Icon,
  CalendarDaysIcon,
  TagIcon,
  ArrowTopRightOnSquareIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

interface Props {
  jobs: JobIndexPostResponse[];
  loading: boolean;
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  mode?: "search" | "recommended";
}

const JOBLIST_AD_SLOT_ID = (import.meta.env.VITE_GOOGLE_ADS_JOBLIST_SLOT_ID as string | undefined)
  ?? (import.meta.env.VITE_GADS_JOBLIST_SLOT_ID as string | undefined);

const JobList: React.FC<Props> = ({
  jobs,
  loading,
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  mode = "search",
}) => {
  const listTopId = "job-list-top";
  const [openJobIds, setOpenJobIds] = useState<Set<number>>(new Set());
  const [savingJobIds, setSavingJobIds] = useState<Set<number>>(new Set());
  const [savedJobIds, setSavedJobIds] = useState<Set<number>>(new Set());
  const [detailsMap, setDetailsMap] = useState<Map<number, JobIndexPostResponse>>(new Map());
  const { user } = useUser();

  const handleSaveJob = async (jobId: number) => {
    const userId = user?.userId;
    const accessToken = user?.accessToken;
    const savedJobsArray = localStorage.getItem("savedJobsArray");
    if (!userId || !jobId || !accessToken) return;
    const api = createApiClient(ProfileApi, accessToken);
    if (savedJobsArray) {
      const savedJobs = new Set(savedJobsArray.split(",").map(Number));
      if (savedJobs.has(jobId)) return;
    }
    setSavingJobIds(prev => new Set(prev).add(jobId));
    try {
      await api.saveJobForUser({ userId: String(userId), jobId: String(jobId) });
      setSavedJobIds(prev => new Set(prev).add(jobId));
      const currentSavedJobs = localStorage.getItem("savedJobsArray");
      if (currentSavedJobs) {
        const arr = currentSavedJobs.split(",");
        if (!arr.includes(String(jobId))) {
          arr.push(String(jobId));
          localStorage.setItem("savedJobsArray", arr.join(","));
        }
      } else {
        localStorage.setItem("savedJobsArray", String(jobId));
      }
    } catch (e) {
      handleApiError(e).then(error => {
        console.error("Error saving job:", error.message);
        globalThis.location.reload();
      });
    } finally {
      setSavingJobIds(prev => {
        const next = new Set(prev); next.delete(jobId); return next;
      });
      try {
        const savedJobsResponse = await api.getSavedJobsByUserId({ userId: userId ?? "" });
        localStorage.setItem(
          "savedJobsArray",
          savedJobsResponse.items
            ?.map(item => (typeof item.jobID === "number" ? String(item.jobID) : undefined))
            .filter(Boolean)
            .join(",") ?? ""
        );
      } catch (e) {
        console.error("Error fetching saved jobs after saving:", e);
      }
    }
  };

  const handleRemoveSavedJob = async (jobId: number) => {
    const userId = user?.userId;
    const accessToken = user?.accessToken;
    if (!userId || !jobId || !accessToken) return;
    const api = createApiClient(ProfileApi, accessToken);
    setSavingJobIds(prev => new Set(prev).add(jobId));
    try {
      await api.removeSavedJobForUser({ userId: String(userId), jobId: String(jobId) });
      setSavedJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
      const currentSavedJobs = localStorage.getItem("savedJobsArray");
      if (currentSavedJobs) {
        const updated = currentSavedJobs.split(",").map(Number).filter(id => id !== jobId);
        localStorage.setItem("savedJobsArray", updated.join(","));
      }
    } catch (e) {
      handleApiError(e).then(error => {
        console.error("Error removing saved job:", error.message);
        globalThis.location.reload();
      });
    } finally {
      setSavingJobIds(prev => { const next = new Set(prev); next.delete(jobId); return next; });
      try {
        const savedJobsResponse = await api.getSavedJobsByUserId({ userId: userId ?? "" });
        localStorage.setItem(
          "savedJobsArray",
          savedJobsResponse.items
            ?.map(item => (typeof item.jobID === "number" ? String(item.jobID) : undefined))
            .filter(Boolean)
            .join(",") ?? ""
        );
      } catch (e) {
        console.error("Error fetching saved jobs after removing:", e);
      }
    }
  };

  const truncateWords = (text: string, limit: number) => {
    const words = text.trim().split(/\s+/);
    if (words.length <= limit) return { snippet: text.trim(), truncated: false };
    return { snippet: words.slice(0, limit).join(" ") + "…", truncated: true };
  };

  const handleToggleDescription = async (jobID?: number | null) => {
    if (jobID == null) return;
    const willOpen = !openJobIds.has(jobID);
    setOpenJobIds(prev => {
      const next = new Set(prev);
      if (next.has(jobID)) {
        next.delete(jobID);
      } else {
        next.add(jobID);
      }
      return next;
    });
    if (willOpen) {
      try {
        const jobApi = createApiClient(JobIndexPostsApi);
        const fresh = await jobApi.getJobPostsById({ id: jobID });
        if (fresh) setDetailsMap(prev => new Map(prev).set(jobID, fresh));
      } catch (e) {
        console.warn("Failed to fetch job details", e);
      }
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem("savedJobsArray");
    if (saved) {
      const ids = saved.split(",").map(Number).filter(n => !Number.isNaN(n));
      setSavedJobIds(new Set(ids));
    }
  }, []);

  const normalizeFormat = (fmt?: string | null): string | undefined => {
    if (!fmt) return undefined;
    const cleaned = fmt.trim().replace(/^\./, "").toLowerCase();
    return cleaned.length > 0 ? cleaned : undefined;
  };

  const mimeFromFormat = (fmt?: string | null): string | undefined => {
    switch (normalizeFormat(fmt)) {
      case "jpg":
      case "jpeg":
        return "image/jpeg";
      case "png":
        return "image/png";
      case "gif":
        return "image/gif";
      case "bmp":
        return "image/bmp";
      case "webp":
        return "image/webp";
      case "svg":
      case "svg+xml":
        return "image/svg+xml";
      default:
        return undefined;
    }
  };

  const inferMimeFromContent = (compact: string): string => {
    if (compact.startsWith("iVBOR")) return "image/png";
    if (compact.startsWith("R0lGOD")) return "image/gif";
    if (compact.startsWith("Qk")) return "image/bmp";
    if (compact.startsWith("UklGR")) return "image/webp";
    return "image/jpeg";
  };

  const composeDataUri = (compact: string, mimeType?: string | null, format?: string | null): string => {
    const declared = mimeType?.trim();
    if (declared) {
      return `data:${declared};base64,${compact}`;
    }

    const formatMime = mimeFromFormat(format);
    if (formatMime) {
      return `data:${formatMime};base64,${compact}`;
    }

    return `data:${inferMimeFromContent(compact)};base64,${compact}`;
  };

  const resolvePictureSource = (
    raw?: string | null,
    mimeType?: string | null,
    format?: string | null
  ): string | null => {
    if (!raw) return null;
    const trimmed = raw.trim();
    if (trimmed.length === 0) return null;
    if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
      return trimmed;
    }

    const compact = trimmed.split(/\s+/).join("");
    const looksBase64 = compact.length > 48 && compact.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(compact);
    if (looksBase64) {
      return composeDataUri(compact, mimeType, format);
    }

    if (trimmed.startsWith("/")) {
      try {
        return new URL(trimmed, getApiBaseUrl()).toString();
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  };

  const formatPostedDate = (value?: Date | string | null): string | null => {
    if (!value) return null;
    const parsed = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(parsed.getTime())) return null;
    return parsed.toLocaleDateString("da-DK", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const totalPages = Math.ceil(totalCount / pageSize);
  const pageStart = totalCount > 0 ? (currentPage - 1) * pageSize + 1 : 0;
  const pageEnd = totalCount > 0 ? Math.min(currentPage * pageSize, totalCount) : 0;
  const isRecommendedMode = mode === "recommended";
  const ListModeIcon = isRecommendedMode ? SparklesIcon : MagnifyingGlassIcon;
  const listTitle = isRecommendedMode ? "Anbefalede job" : "Søgeresultater";
  const listDescription = isRecommendedMode
    ? "Et roligere overblik over de job, der passer bedst til din profil og dine aktuelle filtre."
    : "Aktuelle opslag i en mere overskuelig liste, så de er lettere at skimme på både mobil og desktop.";
  const emptyTitle = isRecommendedMode ? "Ingen anbefalinger lige nu" : "Ingen job fundet";
  const emptyDescription = isRecommendedMode
    ? "Prøv at justere dine filtre eller vend tilbage senere, når der er flere relevante opslag."
    : "Udvid din søgning med færre filtre eller flere søgeord for at få flere resultater.";

  const renderListHeader = () => (
    <section className="mb-4 rounded-[1.75rem] border border-base-300/70 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 p-4 shadow-[0_20px_50px_-40px_rgba(15,23,42,0.55)] sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <span
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] ${isRecommendedMode
              ? "border-secondary/20 bg-secondary/10 text-secondary"
              : "border-primary/20 bg-primary/10 text-primary"}`}
          >
            <ListModeIcon className="h-4 w-4" aria-hidden="true" />
            {isRecommendedMode ? "Anbefalet visning" : "Resultatvisning"}
          </span>

          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">{listTitle}</h2>
            <p className="max-w-2xl text-sm leading-6 text-base-content/70 sm:text-base">{listDescription}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:min-w-[17rem]">
          <div className="rounded-[1.25rem] border border-base-300/70 bg-base-100/80 p-3 shadow-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Viser</p>
            <p className="mt-2 text-xl font-semibold text-base-content">
              {loading ? "..." : pageStart && pageEnd ? `${pageStart}-${pageEnd}` : "0"}
            </p>
            <p className="text-xs text-base-content/60">{loading ? "henter job" : `af ${totalCount} opslag`}</p>
          </div>

          <div className="rounded-[1.25rem] border border-base-300/70 bg-base-100/80 p-3 shadow-sm">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Side</p>
            <p className="mt-2 text-xl font-semibold text-base-content">{loading ? "..." : `${currentPage} / ${Math.max(totalPages, 1)}`}</p>
            <p className="text-xs text-base-content/60">{isRecommendedMode ? "prioriterede match" : "opdaterede resultater"}</p>
          </div>
        </div>
      </div>
    </section>
  );

  const renderJobCard = (job: JobIndexPostResponse, idx: number) => {
    const jobId = job.id;
    const hasValidId = typeof jobId === "number";
    const safeJobId = hasValidId ? jobId : undefined;
    const isOpen = safeJobId != null && openJobIds.has(safeJobId);
    const isSaving = safeJobId != null && savingJobIds.has(safeJobId);
    const isSaved = safeJobId != null && savedJobIds.has(safeJobId);
    const freshDetails = safeJobId != null ? detailsMap.get(safeJobId) : undefined;
    const bannerPicture = resolvePictureSource(
      freshDetails?.bannerPicture ?? job.bannerPicture ?? null,
      freshDetails?.bannerMimeType ?? job.bannerMimeType ?? null,
      freshDetails?.bannerFormat ?? job.bannerFormat ?? null
    );
    const footerPicture = resolvePictureSource(
      freshDetails?.footerPicture ?? job.footerPicture ?? null,
      freshDetails?.footerMimeType ?? job.footerMimeType ?? null,
      freshDetails?.footerFormat ?? job.footerFormat ?? null
    );
    const descriptionSource = freshDetails?.description ?? job.description ?? null;
    const canSave = Boolean(user?.userId && user?.accessToken && safeJobId != null);
    const resultNumber = (currentPage - 1) * pageSize + idx + 1;
    const postedDateLabel = formatPostedDate(job.postedDate ?? null);
    const safeCompanyUrl = sanitizeExternalUrl(job.companyUrl ?? undefined);

    let descriptionBlock: React.ReactNode;
    if (!descriptionSource || descriptionSource.trim() === "") {
      descriptionBlock = <p className="text-sm italic text-base-content/60">Ingen beskrivelse tilgængelig.</p>;
    } else if (isOpen) {
      descriptionBlock = <p className="whitespace-pre-line text-sm leading-7 text-base-content">{descriptionSource}</p>;
    } else {
      const { snippet, truncated } = truncateWords(descriptionSource, 100);
      descriptionBlock = <p className="whitespace-pre-line text-sm leading-7 text-base-content">{snippet}</p>;
    }

    const safeJobUrl = sanitizeExternalUrl(job.jobUrl ?? undefined);

    return (
      <article
        key={safeJobId ?? idx}
        className="group rounded-[1.75rem] border border-base-300/70 bg-gradient-to-br from-base-100 via-base-100 to-primary/5 p-4 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.58)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_72px_-42px_rgba(15,23,42,0.64)] sm:p-5"
        data-testid="job-card"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold ${isRecommendedMode
                  ? "border-secondary/20 bg-secondary/10 text-secondary"
                  : "border-primary/20 bg-primary/10 text-primary"}`}
              >
                {isRecommendedMode ? <SparklesIcon className="h-4 w-4" aria-hidden="true" /> : <MagnifyingGlassIcon className="h-4 w-4" aria-hidden="true" />}
                {isRecommendedMode ? "Anbefalet match" : `Resultat ${resultNumber}`}
              </span>

              {job.category && (
                <span className="inline-flex items-center gap-1 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1 text-xs font-medium text-base-content/75">
                  <TagIcon className="h-4 w-4" aria-hidden="true" />
                  {job.category}
                </span>
              )}

              {postedDateLabel && (
                <span className="inline-flex items-center gap-1 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1 text-xs font-medium text-base-content/70">
                  <CalendarDaysIcon className="h-4 w-4" aria-hidden="true" />
                  Publiceret {postedDateLabel}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="text-xl font-semibold leading-tight text-base-content sm:text-[1.6rem]">{job.title ?? "(Ingen titel)"}</h3>

            {(job.company || job.location) ? (
              <div className="flex flex-wrap gap-2 text-sm text-base-content/80">
                {job.company && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/85 px-3 py-1.5 font-medium shadow-sm">
                    <BuildingOffice2Icon className="h-4 w-4" aria-hidden="true" />
                    {job.company}
                  </span>
                )}
                {job.location && (
                  <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/85 px-3 py-1.5 shadow-sm">
                    <MapPinIcon className="h-4 w-4" aria-hidden="true" />
                    {job.location}
                  </span>
                )}
              </div>
            ) : (
              <p className="text-sm italic text-base-content/50">Ingen virksomhedsoplysninger.</p>
            )}
          </div>

        {bannerPicture && (
          <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-[1.5rem] border border-base-300/70 bg-base-100/80 p-3 shadow-sm">
            <img
              src={bannerPicture}
              alt="Banner for jobopslag"
              className="h-auto max-h-52 w-full rounded-xl object-contain sm:max-h-60"
              loading="lazy"
            />
          </div>
        )}

          <div className="rounded-[1.35rem] border border-base-300/80 bg-base-100/80 p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-3">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Beskrivelse</p>
              {!descriptionSource || descriptionSource.trim() === "" ? null : (
                <span className="text-xs text-base-content/45">{isOpen ? "Fuld visning" : "Kort overblik"}</span>
              )}
            </div>
            {descriptionBlock}
          </div>

          {footerPicture && (
            <div className="mx-auto w-full max-w-xl overflow-hidden rounded-[1.5rem] border border-base-300/70 bg-base-100/80 p-3 shadow-sm">
            <img
              src={footerPicture}
              alt="Footer grafik for jobopslag"
              className="h-auto max-h-36 w-full rounded-xl object-contain sm:max-h-44"
              loading="lazy"
            />
          </div>
        )}

          <div className="flex flex-col gap-2 border-t border-base-300/80 pt-3 sm:flex-row sm:flex-wrap sm:items-center">
          {safeJobUrl && (
            <a
              href={safeJobUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary btn-sm min-h-11 rounded-full px-4 shadow-sm"
            >
              <span className="inline-flex items-center gap-1">
                <ArrowTopRightOnSquareIcon className="w-4 h-4" aria-hidden="true" />
                Gå til opslag
              </span>
            </a>
          )}
          {safeCompanyUrl && (
            <a
              href={safeCompanyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-ghost btn-sm min-h-11 rounded-full border border-base-300/80 bg-base-100/80 px-4"
            >
              <span className="inline-flex items-center gap-1">
                <BuildingOffice2Icon className="w-4 h-4" aria-hidden="true" />
                Virksomhed
              </span>
            </a>
          )}
          {canSave && !isSaved && safeJobId != null && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleSaveJob(safeJobId)}
              className="btn btn-sm min-h-11 rounded-full border border-success/40 bg-base-100/80 px-4 text-success hover:bg-success/10 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1">
                <BookmarkIcon className="w-4 h-4" aria-hidden="true" />
                {isSaving ? "Gemmer…" : "Gem job"}
              </span>
            </button>
          )}
          {canSave && isSaved && safeJobId != null && (
            <button
              type="button"
              disabled={isSaving}
              onClick={() => handleRemoveSavedJob(safeJobId)}
              className="btn btn-sm min-h-11 rounded-full border border-error/40 bg-base-100/80 px-4 text-error hover:bg-error/10 disabled:opacity-50"
            >
              <span className="inline-flex items-center gap-1">
                <BookmarkSlashIcon className="w-4 h-4" aria-hidden="true" />
                {isSaving ? "Fjerner…" : "Fjern gemt"}
              </span>
            </button>
          )}
          {!canSave && (
            <button
              type="button"
              disabled
              className="btn btn-sm min-h-11 rounded-full border border-base-content/20 bg-base-200/70 px-4 text-base-content/40 cursor-not-allowed"
              title="Log ind for at gemme job"
            >
              <span className="inline-flex items-center gap-1">
                <BookmarkIcon className="w-4 h-4" aria-hidden="true" />
                Gem job
              </span>
            </button>
          )}
          {descriptionSource && descriptionSource.trim() !== "" && safeJobId != null && (
            <button
              type="button"
              onClick={() => handleToggleDescription(safeJobId)}
              className="btn btn-ghost btn-sm min-h-11 rounded-full border border-base-content/15 bg-base-100/70 px-4 text-base-content/75 hover:bg-base-content/8"
            >
              {isOpen ? "Vis mindre" : "Læs mere"}
            </button>
          )}
          </div>
        </div>
      </article>
    );
  };

  if (loading) {
    return (
      <>
        <div id={listTopId} className="scroll-mt-24" aria-hidden="true" />
        {renderListHeader()}
        <JobListSkeleton count={pageSize} />
      </>
    );
  }

  if (!jobs.length) {
    return (
      <>
        <div id={listTopId} className="scroll-mt-24" aria-hidden="true" />
        {renderListHeader()}
        <div className="rounded-[1.75rem] border border-dashed border-base-300/80 bg-base-100/75 px-6 py-10 text-center shadow-sm">
          <div className={`mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full ${isRecommendedMode ? "bg-secondary/10 text-secondary" : "bg-primary/10 text-primary"}`}>
            {isRecommendedMode ? <SparklesIcon className="h-7 w-7" aria-hidden="true" /> : <MagnifyingGlassIcon className="h-7 w-7" aria-hidden="true" />}
          </div>
          <h3 className="text-xl font-semibold text-base-content">{emptyTitle}</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-base-content/65">{emptyDescription}</p>
        </div>
      </>
    );
  }

  const items: Array<{ kind: "job"; job: JobIndexPostResponse; idx: number } | { kind: "ad"; key: string }> = [];
  jobs.forEach((job, idx) => {
    items.push({ kind: "job", job, idx });
    if ((idx === 2 || idx === 7) && totalCount > idx + 1) {
      items.push({ kind: "ad", key: `joblist-ad-${currentPage}-${idx}` });
    }
  });

  return (
    <>
      <div id={listTopId} className="scroll-mt-24" aria-hidden="true" />
      {renderListHeader()}
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={currentPage}
          className="grid gap-4"
          initial={{ opacity: 0, x: 32 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -32 }}
          transition={{ duration: 0.24, ease: "easeOut" }}
        >
          {items.map(item => {
            if (item.kind === "job") return renderJobCard(item.job, item.idx);
            return (
              <AdWrapper
                key={item.key}
                slotId={JOBLIST_AD_SLOT_ID}
                title="Sponsoreret jobopslag"
                className="border-dashed"
              />
            );
          })}
        </motion.div>
      </AnimatePresence>
      <Paging
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        scrollTargetId={listTopId}
        scrollBehavior="smooth"
      />
    </>
  );
};

export default JobList;