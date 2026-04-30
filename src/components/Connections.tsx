import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowTopRightOnSquareIcon,
  CheckCircleIcon,
  ClockIcon,
  LinkIcon,
  ShieldCheckIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { AuthenticationApi, LinkedInAuthApi } from "../findjobnu-auth";
import { createAuthClient } from "../helpers/ApiFactory";
import { prepareLinkedInLogin } from "../helpers/oauth";
import { sanitizeExternalUrl } from "../helpers/url";

interface Props {
  userId: string;
  accessToken: string;
}

interface Connection {
  id: string;
  platform: string;
  username: string;
  isConnected: boolean;
  profileUrl?: string;
  lastSync?: Date;
}

type LinkedInUserInfo = {
  hasVerifiedLinkedIn?: boolean | null;
  userName?: string | null;
  linkedInProfileUrl?: string | null;
  lastLinkedInSync?: Date | null;
};

const updateConnectionByPlatform = (
  items: Connection[],
  platform: string,
  updater: (connection: Connection) => Connection,
) => items.map((connection) => (connection.platform === platform ? updater(connection) : connection));

const updateConnectionById = (
  items: Connection[],
  connectionId: string,
  updater: (connection: Connection) => Connection,
) => items.map((connection) => (connection.id === connectionId ? updater(connection) : connection));

const applyLinkedInUserInformation = (items: Connection[], userInformation?: LinkedInUserInfo) =>
  updateConnectionByPlatform(items, "LinkedIn", (connection) => ({
    ...connection,
    isConnected: userInformation?.hasVerifiedLinkedIn ?? false,
    username: userInformation?.userName ?? "",
    profileUrl: userInformation?.linkedInProfileUrl ?? "",
    lastSync: userInformation?.lastLinkedInSync ?? new Date(),
  }));

const clearConnection = (items: Connection[], connectionId: string) =>
  updateConnectionById(items, connectionId, (connection) => ({
    ...connection,
    isConnected: false,
    username: "",
    profileUrl: "",
    lastSync: undefined,
  }));

const ConnectionsComponent: React.FC<Props> = ({ userId, accessToken }) => {
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "1",
      platform: "LinkedIn",
      username: "",
      isConnected: false,
      profileUrl: "",
      lastSync: undefined,
    },
    {
      id: "2",
      platform: "GitHub",
      username: "",
      isConnected: false,
      profileUrl: "",
      lastSync: undefined,
    },
  ]);
  const [loading, setLoading] = useState(false);
  const connectedCount = connections.filter((connection) => connection.isConnected).length;

  useEffect(() => {
    // Fetch user profile to check if LinkedIn user
    const fetchUserProfile = async () => {
      try {
        const authApi = createAuthClient(AuthenticationApi, accessToken);
        const response = await authApi.getUserInformation();
        // If the user is a LinkedIn user, update the LinkedIn connection status
        if (response.success && response.userInformation?.hasVerifiedLinkedIn === true) {
          setConnections((prev) => applyLinkedInUserInformation(prev, response.userInformation));
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    };

    fetchUserProfile();
  }, [userId, accessToken]);

  const linkedInLoginUrl = useMemo(() => (
    import.meta.env.VITE_LINKEDIN_LOGIN_URL ?? "https://auth.findjob.nu/api/auth/linkedin/login"
  ), []);

  const handleLinkedInLogin = () => {
    const redirect = prepareLinkedInLogin(linkedInLoginUrl);
    globalThis.location.href = redirect;
  };

  const handleConnect = async (connectionId: string) => {
    setLoading(true);

    if (connectionId === "1") {
      handleLinkedInLogin();
      return;
    }

    setLoading(false);
  };

  const handleDisconnect = async (connectionId: string) => {
    setLoading(true);

    try {
      const linkedInAuthApi = createAuthClient(LinkedInAuthApi, accessToken);
      await linkedInAuthApi.unlinkLinkedInProfile();
      setConnections((prev) => clearConnection(prev, connectionId));
    } catch (error) {
      console.error("Error unlinking user profile:", error);
    }
    setLoading(false);
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "LinkedIn":
        return (
          <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
          </svg>
        );
      case "GitHub":
        return (
          <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0C5.374 0 0 5.373 0 12 0 17.302 3.438 21.8 8.207 23.387c.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
          </svg>
        );
      default:
        return (
          <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center">
            <span className="text-xs text-white font-bold">{platform[0]}</span>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[1.85rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10 shadow-[0_24px_70px_-36px_rgba(15,23,42,0.45)]">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-36 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.74),transparent_54%)]" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative grid gap-6 p-5 sm:p-6 xl:grid-cols-[minmax(0,1.1fr)_300px]">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
              <LinkIcon className="h-4 w-4" aria-hidden="true" />
              Tilslutninger
            </div>

            <div className="space-y-3">
              <h2 className="text-3xl font-semibold tracking-tight text-base-content sm:text-4xl">
                Forbind dine profiler uden at miste overblikket
              </h2>
              <p className="max-w-3xl text-base leading-7 text-base-content/72 sm:text-lg">
                Saml eksterne profiler ét sted, så import og profilmatch bliver nemmere at forstå og hurtigere at administrere på både mobil og desktop.
              </p>
            </div>

            <div className="space-y-3">
              {[
                "LinkedIn kan bruges til hurtigere onboarding og profilberigelse.",
                "Se tydeligt hvilke profiler der er aktive, og hvornår de sidst blev synkroniseret.",
                "Afbryd forbindelser igen uden at ændre resten af din profilopsætning.",
              ].map((point) => (
                <div key={point} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                  <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                  <span>{point}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[1.5rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-sm sm:p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Forbindelsesstatus</p>
            <div className="mt-4 grid gap-3">
              <div className="rounded-[1.25rem] border border-base-300/70 bg-base-200/35 p-4 shadow-sm">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Aktive</p>
                <p className="mt-2 text-3xl font-semibold text-base-content">{connectedCount}</p>
                <p className="text-sm leading-6 text-base-content/65">af {connections.length} profiler er tilsluttet lige nu</p>
              </div>
              <div className="rounded-[1.25rem] border border-primary/15 bg-primary/8 p-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <ShieldCheckIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-6 text-base-content/68">
                    Forbindelser bruges til at forbedre profilkontekst og import, ikke til at overtage dine eksisterende profilfelter automatisk.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4">
        {connections.map((connection) => {
          const safeProfileUrl = sanitizeExternalUrl(connection.profileUrl);

          return (
            <article key={connection.id} className="rounded-[1.6rem] border border-base-300/70 bg-gradient-to-br from-base-100/95 via-base-100/88 to-primary/5 p-5 shadow-lg backdrop-blur-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_-40px_rgba(15,23,42,0.42)] sm:p-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-base-100/84 shadow-sm">
                    {getPlatformIcon(connection.platform)}
                  </div>

                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-semibold text-base-content">{connection.platform}</h3>
                      <span className={[
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] shadow-sm",
                        connection.isConnected
                          ? "border-success/25 bg-success/10 text-success"
                          : "border-base-300/70 bg-base-100/82 text-base-content/55",
                      ].join(" ")}>
                        <span className={[
                          "h-2 w-2 rounded-full",
                          connection.isConnected ? "bg-success" : "bg-base-content/25",
                        ].join(" ")} />
                        {connection.isConnected ? "Aktiv forbindelse" : "Ikke tilsluttet"}
                      </span>
                    </div>

                    {connection.isConnected ? (
                      <div className="space-y-2 text-sm leading-6 text-base-content/68 sm:text-base">
                        <p>
                          <span className="font-semibold text-base-content">Bruger:</span>{" "}
                          {connection.username || "Profil fundet"}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-base-content/60">
                          <ClockIcon className="h-4 w-4 text-primary" aria-hidden="true" />
                          <span>
                            Sidst synkroniseret: {connection.lastSync ? connection.lastSync.toLocaleDateString("da-DK") : "Ikke registreret endnu"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <p className="max-w-2xl text-sm leading-6 text-base-content/65 sm:text-base">
                        Forbind denne profil for at gøre import og profilopsætning mere sammenhængende.
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col lg:items-stretch">
                  {connection.isConnected ? (
                    <>
                      {safeProfileUrl && (
                        <a
                          href={safeProfileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary min-h-11 rounded-2xl px-5 shadow-lg shadow-primary/20"
                        >
                          Profil
                          <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden="true" />
                        </a>
                      )}
                      <button
                        type="button"
                        className="btn btn-ghost min-h-11 rounded-2xl border border-error/20 bg-error/10 px-5 text-error hover:bg-error/15"
                        onClick={() => handleDisconnect(connection.id)}
                        disabled={loading}
                      >
                        {loading ? "Fjerner..." : "Fjern"}
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-success min-h-11 rounded-2xl px-5 shadow-lg shadow-success/20"
                      onClick={() => handleConnect(connection.id)}
                      disabled={loading}
                    >
                      {loading ? "Tilslutter..." : "Tilslut"}
                    </button>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 px-4 py-4 shadow-sm">
        <div className="flex items-start gap-3 text-sm leading-6 text-base-content/65">
          <SparklesIcon className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
          <p>
          Tilslut dine profiler for at importere relevant information og forbedre din jobsøgning.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ConnectionsComponent;
