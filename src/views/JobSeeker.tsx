import React, { useEffect, useState } from "react";
import { BriefcaseIcon, CheckCircleIcon, DocumentTextIcon, IdentificationIcon, UserIcon, XCircleIcon } from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import Seo from "../components/Seo";
import { ProfileApi } from "../findjobnu-api";
import { AuthenticationApi } from "../findjobnu-auth";
import { createApiClient, createAuthClient } from "../helpers/ApiFactory";
import { mapProfileDtoToProfile } from "../helpers/mappers";

const JobSeeker: React.FC = () => {
  const { user } = useUser();
  const userId = user?.userId ?? "";
  const token = user?.accessToken ?? "";

  const [setupState, setSetupState] = useState({
    loading: false,
    profileFound: false,
    hasExperience: false,
    hasEducation: false,
    hasSkills: false,
    hasTopKeywords: false,
    hasJobAgent: false,
    hasConnections: false,
  });

  useEffect(() => {
    const fetchSetupStatus = async () => {
      if (!userId || !token) {
        setSetupState((prev) => ({ ...prev, loading: false, profileFound: false, hasExperience: false, hasEducation: false, hasSkills: false, hasTopKeywords: false, hasJobAgent: false, hasConnections: false }));
        return;
      }
      setSetupState((prev) => ({ ...prev, loading: true }));
      try {
        const profileApi = createApiClient(ProfileApi, token);
        const profileDto = await profileApi.getProfileByUserId({ userId });
        const mapped = mapProfileDtoToProfile(profileDto);
        const hasProfile = Boolean(mapped?.id);
        const hasExperience = (mapped.experiences?.length ?? 0) > 0;
        const hasEducation = (mapped.educations?.length ?? 0) > 0;
        const hasSkills = (mapped.skills?.length ?? 0) > 0;
        const hasTopKeywords = (mapped.keywords?.length ?? 0) > 0;
        const hasJobAgent = mapped.hasJobAgent === true;

        let hasConnections = false;
        try {
          const authApi = createAuthClient(AuthenticationApi, token);
          const info = await authApi.getUserInformation();
          hasConnections = info.userInformation?.hasVerifiedLinkedIn === true;
        } catch (connectionError) {
          console.warn("Could not load connection status", connectionError);
        }

        setSetupState({
          loading: false,
          profileFound: hasProfile,
          hasExperience,
          hasEducation,
          hasSkills,
          hasTopKeywords,
          hasJobAgent,
          hasConnections,
        });
      } catch (error) {
        console.warn("Could not load profile status", error);
        setSetupState((prev) => ({ ...prev, loading: false, profileFound: false }));
      }
    };

    fetchSetupStatus();
  }, [userId, token]);

  const StatusRow: React.FC<{ label: string; done: boolean; hint?: string }> = ({ label, done, hint }) => (
    <div className="flex items-start gap-3">
      {done ? (
        <CheckCircleIcon className="w-5 h-5 text-success mt-0.5" aria-hidden="true" />
      ) : (
        <XCircleIcon className="w-5 h-5 text-base-300 mt-0.5" aria-hidden="true" />
      )}
      <div>
        <p className="font-medium">{label}</p>
        {hint && <p className="text-sm text-base-content/70">{hint}</p>}
      </div>
    </div>
  );

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Seo
        title="Arbejdssøgende – Værktøjer til CV, profil og jobagent | FindJob.nu"
        description="Få bedre matches, optimer dit CV til ATS, og aktiver jobagenter der finder relevante stillinger for dig."
        path="/arbejdssogende"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Forside", item: "https://findjob.nu/" },
            { "@type": "ListItem", position: 2, name: "Arbejdssøgende", item: "https://findjob.nu/arbejdssogende" }
          ]
        }}
      />
      <div className="hero bg-base-100 rounded-box shadow-xl mb-10">
        <div className="hero-content text-center">
          <div className="max-w-3xl">
            <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
              <span>For dig der søger job</span>
              <UserIcon className="w-8 h-8 text-primary" aria-hidden="true" />
            </h1>
            <p className="text-base-content/70 mt-2">
              Brug vores værktøjer til at lande samtalen hurtigere: et CV der scorer højt i ATS, en udfyldt profil der matcher dig med de rigtige job, og en jobagent der holder dig opdateret.
            </p>
            <div className="mt-4 flex justify-center gap-2 flex-wrap">
              <span className="badge badge-primary badge-outline">Det gode CV</span>
              <span className="badge badge-secondary badge-outline">Profil</span>
              <span className="badge badge-accent badge-outline">Jobagent</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="card bg-base-100 shadow-xl border h-full">
          <div className="card-body p-6 flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>Det gode CV</span>
              <DocumentTextIcon className="w-5 h-5 text-primary" aria-hidden="true" />
            </h2>
            <p className="text-base-content/80">
              Øg din ATS-score med tydelig struktur, de rigtige nøgleord og et layout der kan læses af både systemer og mennesker.
            </p>
            <ul className="list-disc ml-5 space-y-1 text-base-content/80">
              <li>Automatisk tjek af nøgleord og læsbarhed</li>
              <li>Klar guide til PDF, sektioner og sprog</li>
            </ul>
            <a href="/cv" className="btn btn-primary btn-sm w-fit mt-auto">Se CV-guiden</a>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border h-full">
          <div className="card-body p-6 flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>Profil</span>
              <IdentificationIcon className="w-5 h-5 text-secondary" aria-hidden="true" />
            </h2>
            <p className="text-base-content/80">
              En komplet profil gør dine anbefalinger skarpere og genbruger dine oplysninger, så du slipper for gentagelser.
            </p>
            <ul className="list-disc ml-5 space-y-1 text-base-content/80">
              <li>Matches på kompetencer, branche og geografi</li>
              <li>Del samme data på tværs af ansøgninger</li>
            </ul>
            <a href="/profile" className="btn btn-secondary btn-sm w-fit mt-auto">Udfyld profil</a>
          </div>
        </div>

        <div className="card bg-base-100 shadow-xl border h-full">
          <div className="card-body p-6 flex flex-col gap-3">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <span>Jobagent</span>
              <BriefcaseIcon className="w-5 h-5 text-accent" aria-hidden="true" />
            </h2>
            <p className="text-base-content/80">
              Jobagenten holder øje for dig og sender besked, så du kan reagere hurtigt på relevante opslag.
            </p>
            <ul className="list-disc ml-5 space-y-1 text-base-content/80">
              <li>Notifikationer når nye opslag matcher dig</li>
              <li>Skift filter hurtigt uden at miste historik</li>
            </ul>
            <a href="/profile?panel=jobAgent" className="btn btn-accent btn-sm w-fit mt-auto">Aktivér jobagent</a>
          </div>
        </div>
      </div>

      <div className="mb-10">
        <div className="card bg-gradient-to-br from-base-200 via-base-100 to-base-200 shadow-xl border">
          <div className="card-body grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-4">
              <div className="badge badge-primary badge-outline">Anbefalede job</div>
              <h2 className="text-2xl lg:text-3xl font-bold leading-snug">Sådan får du personlige jobanbefalinger</h2>
              <p className="text-base-content/80">
                Vi matcher dig på tværs af kompetencer, erfaringer og præferencer. De vigtigste signaler er dine <strong>Færdigheder</strong> og <strong>Top kompetencer</strong>, men jo mere du udfylder, desto mere specialiserede anbefalinger får du.
              </p>
              <ul className="list-disc ml-5 space-y-2 text-base-content/80">
                <li>Tilføj færdigheder og top kompetencer for at finjustere matchingen.</li>
                <li>Supplér med erfaringer og uddannelser for bedre kontekst.</li>
                <li>Aktivér jobagenten og forbind LinkedIn for løbende, bedre forslag.</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <a className="btn btn-primary" href="/profile">Åbn profil</a>
                <a className="btn btn-outline" href="/profile?panel=jobAgent">Jobagent</a>
                <a className="btn btn-outline" href="/jobsearch?panel=recommended">Se anbefalinger</a>
              </div>
            </div>

            <div className="bg-base-100 border border-base-200 rounded-2xl p-4 sm:p-5 shadow-inner">
              {userId ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-base-content/70">Status for anbefalinger</p>
                      <p className="text-lg font-semibold">{setupState.loading ? "Opdaterer..." : "Klar til bedre matches"}</p>
                    </div>
                    <span className={`badge ${setupState.hasSkills && setupState.hasTopKeywords ? "badge-success" : ""}`}>
                      {setupState.hasSkills && setupState.hasTopKeywords ? "Prioriteret" : "Udfyld færdigheder"}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <StatusRow
                      label="Profil + erfaring/uddannelse/færdigheder"
                      done={setupState.profileFound && (setupState.hasExperience || setupState.hasEducation || setupState.hasSkills)}
                      hint="Jo mere du udfylder, desto skarpere matcher vi."
                    />
                    <StatusRow
                      label="Færdigheder og top kompetencer"
                      done={setupState.hasSkills && setupState.hasTopKeywords}
                      hint="Dette vægter højest i vores anbefalinger."
                    />
                    <StatusRow
                      label="Jobagent aktiveret"
                      done={setupState.hasJobAgent}
                      hint="Holder øje for dig og sender nye match."
                    />
                    <StatusRow
                      label="Forbindelser (LinkedIn)"
                      done={setupState.hasConnections}
                      hint="Importér erfaringer og hold profilen opdateret."
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <a className="btn btn-sm btn-primary" href="/profile">Opdatér profil</a>
                    <a className="btn btn-sm btn-outline" href="/profile?panel=jobAgent">Åbn jobagent</a>
                    <a className="btn btn-sm btn-outline" href="/profile">Tilføj kompetencer</a>
                    <a className="btn btn-sm btn-outline" href="/profile?panel=connections">Forbind LinkedIn</a>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 text-center">
                  <p className="text-lg font-semibold">Log ind for at se din status</p>
                  <p className="text-base-content/70">
                    Opret en konto, udfyld din profil, og kom tilbage for at se hvordan du står for anbefalingerne.
                  </p>
                  <div className="flex justify-center gap-3">
                    <a className="btn btn-primary" href="/register">Opret bruger</a>
                    <a className="btn btn-outline" href="/login">Log ind</a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeeker;
