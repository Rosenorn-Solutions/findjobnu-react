import React, { useEffect, useState } from "react";
import { BriefcaseIcon, DocumentTextIcon, IdentificationIcon, UserIcon } from "@heroicons/react/24/outline";
import { useUser } from "../context/UserContext.shared";
import Seo from "../components/Seo";
import ProfileSetupStatus from "../components/ProfileSetupStatus";
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

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <Seo
        title="Gratis jobsøgningsværktøjer 2026 – CV-tjek, profil og jobagent | FindJob.nu"
        description="Få gratis CV-analyse, personlige jobanbefalinger og automatiske jobagenter. Alt hvad du skal bruge for at finde dit næste job."
        path="/arbejdssogende"
        jsonLd={[
          {
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Værktøjer til arbejdssøgende",
            description: "Gratis jobsøgningsværktøjer: CV-analyse, profil-matching og jobagenter",
            url: "https://findjob.nu/arbejdssogende",
            mainEntity: {
              "@type": "ItemList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Gratis CV-analyse",
                  description: "Upload dit CV og få en læsbarhedsscore og ATS-tjek",
                  url: "https://findjob.nu/cv"
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Profil og anbefalinger",
                  description: "Opret din profil og få personlige jobanbefalinger",
                  url: "https://findjob.nu/profile"
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: "Jobagent",
                  description: "Få besked når nye relevante job bliver opslået",
                  url: "https://findjob.nu/profile?panel=jobAgent"
                }
              ]
            }
          },
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Hvordan får jeg personlige jobanbefalinger?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Opret en gratis profil på FindJob.nu og tilføj dine færdigheder og top kompetencer. Jo mere du udfylder, desto bedre matcher vi dig med relevante job."
                }
              },
              {
                "@type": "Question",
                name: "Hvad er en jobagent?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "En jobagent holder automatisk øje med nye jobopslag der matcher dine præferencer og sender dig besked, så du kan reagere hurtigt på relevante stillinger."
                }
              },
              {
                "@type": "Question",
                name: "Koster det noget at bruge FindJob.nu?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Nej, alle vores værktøjer er gratis at bruge. Du kan lave CV-tjek, oprette profil, få jobanbefalinger og aktivere jobagenter uden at betale."
                }
              },
              {
                "@type": "Question",
                name: "Hvordan finder man job uden erfaring?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Fokuser på dine færdigheder, uddannelse og projekter i dit CV. Brug vores CV-guide til at fremhæve dine styrker, og søg på junior-stillinger eller trainee-programmer."
                }
              }
            ]
          },
          {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Forside", item: "https://findjob.nu/" },
              { "@type": "ListItem", position: 2, name: "Værktøjer til arbejdssøgende", item: "https://findjob.nu/arbejdssogende" }
            ]
          }
        ]}
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

            <ProfileSetupStatus userId={userId} setupState={setupState} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobSeeker;
