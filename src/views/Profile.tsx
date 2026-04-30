import React, { useEffect, useMemo, useState } from "react";
import { useUser } from "../context/UserContext.shared";
import UserProfileComponent from "../components/UserProfile";
import ConnectionsComponent from "../components/Connections";
import JobAgentCard from "../components/JobAgentCard";
import SavedJobs from "../components/SavedJobs";
import SettingsPanel from "../components/SettingsPanel";
import { NavLink, Navigate, Route, Routes, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Seo from "../components/Seo";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronRightIcon, ShieldCheckIcon, SparklesIcon } from "@heroicons/react/24/outline";

type PanelKey = "profile" | "connections" | "jobAgent" | "savedJobs" | "settings";

const PanelWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <motion.div
    className="min-h-50"
    initial={{ opacity: 0, x: 24 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -24 }}
    transition={{ duration: 0.22, ease: "easeOut" }}
  >
    {children}
  </motion.div>
);

const Profile: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId || "";
  const token = user?.accessToken || "";
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const [profileRefreshKey] = useState(0);

  useEffect(() => {
    if (!userId || !token) {
      navigate("/login");
    }
  }, [userId, token, navigate]);

  useEffect(() => {
    const panel = searchParams.get("panel") as PanelKey | null;
    if (!panel) return;
    const panelPathMap: Record<PanelKey, string> = {
      profile: "",
      connections: "connections",
      jobAgent: "job-agent",
      savedJobs: "saved-jobs",
      settings: "settings",
    };
    const target = panelPathMap[panel] ?? "";
    navigate(target ? `/profile/${target}` : "/profile", { replace: true });
  }, [navigate, searchParams]);

  const navItems = useMemo(
    () => [
      {
        key: "profile" as const,
        label: "Profil",
        path: "/profile",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 20a6 6 0 0 1 12 0" />
          </svg>
        ),
      },
      {
        key: "connections" as const,
        label: "Forbindelser",
        path: "/profile/connections",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 8a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm14 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM6 20a4 4 0 0 1 4-4h0M14 16h0a4 4 0 0 1 4 4M12 4a3 3 0 1 1 0 6 3 3 0 0 1 0-6Zm-6 10a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4" />
          </svg>
        ),
      },
      {
        key: "jobAgent" as const,
        label: "Jobagent",
        path: "/profile/job-agent",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 7h16v10H4z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M4 12h16" />
          </svg>
        ),
      },
      {
        key: "savedJobs" as const,
        label: "Gemte Jobs",
        path: "/profile/saved-jobs",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.5 4.5h11a1 1 0 0 1 1 1V20l-7.5-4.5L5.5 20V5.5a1 1 0 0 1 1-1Z" />
          </svg>
        ),
      },
      {
        key: "settings" as const,
        label: "Indstillinger",
        path: "/profile/settings",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 0 0 2.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 0 0 1.065 2.572c1.757.426 1.757 2.924 0 3.35a1.724 1.724 0 0 0-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 0 0-2.572 1.065c-.426 1.757-2.924 1.757-3.35 0a1.724 1.724 0 0 0-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 0 0-1.065-2.572c-1.757-.426-1.757-2.924 0-3.35.657-.159 1.182-.684 1.065-1.34-.94-1.543.826-3.31 2.37-2.37.642.392 1.456.133 1.572-.698Z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
        ),
      },
    ],
    []
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Seo
        title="Min profil | FindJob.nu"
        description="Administrer din FindJob.nu-profil, forbindelser, jobagenter og gemte job."
        path="/profile"
        noIndex
      />
      <div className="not-prose space-y-6">
        <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.74),transparent_54%)]" />
          <div className="pointer-events-none absolute -left-12 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
          <div className="pointer-events-none absolute -right-10 top-10 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

          <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_320px] lg:p-8">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                <SparklesIcon className="h-4 w-4" aria-hidden="true" />
                Min profil
              </div>

              <div className="space-y-3">
                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-[2.85rem]">
                  Saml din profil, onboarding og opfølgning ét sted
                </h1>
                <p className="max-w-2xl text-base leading-7 text-base-content/72 sm:text-lg">
                  Opdater dine oplysninger, styrk dit matchgrundlag og hop direkte videre til gemte job, forbindelser og jobagent fra en roligere og mere mobilvenlig profiloplevelse.
                </p>
              </div>

              <div className="flex flex-wrap gap-3 text-sm text-base-content/68">
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/72 px-4 py-2 shadow-sm">
                  Redigering og onboarding er samlet i samme flow
                </span>
                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/70 bg-base-100/72 px-4 py-2 shadow-sm">
                  Hurtigere overblik over dine næste profiltrin
                </span>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-base-300/70 bg-base-100/80 p-5 shadow-lg backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Profilhub</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-[1.25rem] border border-base-300/70 bg-base-200/40 p-4 shadow-sm">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Paneler</p>
                  <p className="mt-2 text-3xl font-semibold text-base-content">{navItems.length}</p>
                  <p className="text-sm leading-6 text-base-content/65">Profil, forbindelser, jobagent, gemte job og indstillinger er samlet i samme navigation.</p>
                </div>
                <div className="rounded-[1.25rem] border border-primary/15 bg-primary/8 p-4 shadow-sm">
                  <p className="text-sm font-semibold text-base-content">Byg profilen løbende</p>
                  <p className="mt-1 text-sm leading-6 text-base-content/68">
                    Udfyld lidt ad gangen, og brug import samt redigering, når du er klar til at forbedre dine anbefalinger.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 items-start gap-6 pb-8 lg:grid-cols-[300px_minmax(0,1fr)]">
          <aside className="relative self-start overflow-hidden rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-base-100/92 via-base-100/86 to-primary/5 shadow-lg backdrop-blur-sm lg:sticky lg:top-24">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_58%)]" />
            <div className="relative space-y-5 p-4 sm:p-5 lg:p-6">
              <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-lg font-semibold text-base-content">Min profil</h2>
                    <p className="text-sm leading-6 text-base-content/68">
                      Skift hurtigt mellem dine profilområder uden at miste overblikket, også på mobil.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible" aria-label="Profil navigation">
                {navItems.map((item) => (
                  <NavLink
                    key={item.key}
                    to={item.path}
                    end={item.key === "profile"}
                    className={({ isActive }) =>
                      [
                        "group flex min-h-12 min-w-[190px] items-center justify-between gap-3 rounded-2xl border px-4 py-3 text-sm font-medium transition-all duration-200 lg:min-w-0",
                        isActive
                          ? "border-primary/25 bg-base-100 text-base-content shadow-lg shadow-primary/10"
                          : "border-transparent bg-base-100/55 text-base-content/72 hover:border-base-300/70 hover:bg-base-100/80",
                      ].join(" ")
                    }
                    role="button"
                    aria-current={undefined}
                  >
                    <span className="flex items-center gap-3">
                      <span className="text-base-content/80 transition-colors group-hover:text-base-content">{item.icon}</span>
                      <span>{item.label}</span>
                    </span>
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-base-content/35 transition group-hover:text-base-content/60" aria-hidden="true" />
                  </NavLink>
                ))}
              </div>
            </div>
          </aside>

          <section className="relative overflow-hidden rounded-[1.75rem] border border-base-300/70 bg-base-100/82 shadow-lg backdrop-blur-sm">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.72),transparent_55%)]" />
            <div className="relative p-4 sm:p-5 lg:p-6">
              <AnimatePresence mode="wait" initial={false}>
                <Routes location={location} key={location.pathname}>
                  <Route
                    index
                    element={
                      <PanelWrapper>
                        <UserProfileComponent userId={userId} refreshKey={profileRefreshKey} />
                      </PanelWrapper>
                    }
                  />
                  <Route
                    path="connections"
                    element={
                      <PanelWrapper>
                        <ConnectionsComponent userId={userId} accessToken={token} />
                      </PanelWrapper>
                    }
                  />
                  <Route
                    path="job-agent"
                    element={
                      <PanelWrapper>
                        <JobAgentCard userId={userId} accessToken={token} />
                      </PanelWrapper>
                    }
                  />
                  <Route
                    path="saved-jobs"
                    element={
                      <PanelWrapper>
                        <SavedJobs userId={userId} />
                      </PanelWrapper>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <PanelWrapper>
                        <SettingsPanel />
                      </PanelWrapper>
                    }
                  />
                  <Route path="*" element={<Navigate to="/profile" replace />} />
                </Routes>
              </AnimatePresence>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;