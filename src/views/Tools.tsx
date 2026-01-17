import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
    DocumentTextIcon,
    BellAlertIcon,
    IdentificationIcon,
    BookmarkIcon,
    SparklesIcon,
    WrenchScrewdriverIcon,
    ArrowRightIcon,
    CheckCircleIcon
} from "@heroicons/react/24/outline";
import Seo from "../components/Seo";
import ProfileSetupStatus from "../components/ProfileSetupStatus";
import { useUser } from "../context/UserContext.shared";
import { ProfileApi } from "../findjobnu-api";
import { AuthenticationApi } from "../findjobnu-auth";
import { createApiClient, createAuthClient } from "../helpers/ApiFactory";
import { mapProfileDtoToProfile } from "../helpers/mappers";

type Tool = {
    title: string;
    slug: string;
    description: string;
    features: string[];
    icon: React.ReactNode;
    href: string;
    badge?: string;
    highlight?: boolean;
};

const tools: Tool[] = [
    {
        title: "Gratis CV-analyse",
        slug: "cv-tjek",
        description: "Upload dit CV som PDF og få en øjeblikkelig læsbarhedsscore samt konkrete forbedringsforslag til at klare dig bedre i ATS-systemer.",
        features: [
            "Automatisk læsbarhedsanalyse",
            "ATS-kompatibilitetstjek",
            "Konkrete forbedringsforslag",
            "100% gratis og anonymt"
        ],
        icon: <DocumentTextIcon className="w-8 h-8" aria-hidden="true" />,
        href: "/cv",
        badge: "Populær",
        highlight: true
    },
    {
        title: "Personlige jobanbefalinger",
        slug: "anbefalede-jobs",
        description: "Få job der matcher dine kompetencer og præferencer. Jo mere du udfylder din profil, desto bedre bliver anbefalingerne.",
        features: [
            "Matcher på færdigheder og erfaring",
            "Opdateres automatisk",
            "Gratis at bruge",
            "Ingen spam eller reklamer"
        ],
        icon: <SparklesIcon className="w-8 h-8" aria-hidden="true" />,
        href: "/jobsearch?panel=recommended",
        badge: "Gratis",
        highlight: true
    },
    {
        title: "Jobagent",
        slug: "jobagent",
        description: "Lad os holde øje for dig. Få automatisk besked når nye job matcher dine søgekriterier.",
        features: [
            "Automatiske notifikationer",
            "Tilpas kriterier når som helst",
            "Daglig eller ugentlig opsummering",
            "Afmeld når du vil"
        ],
        icon: <BellAlertIcon className="w-8 h-8" aria-hidden="true" />,
        href: "/profile/job-agent"
    },
    {
        title: "Profil og kompetencer",
        slug: "profil",
        description: "Opbyg din profil med erfaring, uddannelse og færdigheder. Importer direkte fra LinkedIn eller CV.",
        features: [
            "Import fra LinkedIn",
            "CV-parsing",
            "Kompetencemapping",
            "Synlig for anbefalinger"
        ],
        icon: <IdentificationIcon className="w-8 h-8" aria-hidden="true" />,
        href: "/profile"
    },
    {
        title: "Gemte job",
        slug: "gemte-jobs",
        description: "Gem interessante stillinger og følg op på dem senere. Hold styr på dine ansøgninger ét sted.",
        features: [
            "Gem ubegrænset antal job",
            "Organisér efter status",
            "Se deadline og noter",
            "Tilgængelig på alle enheder"
        ],
        icon: <BookmarkIcon className="w-8 h-8" aria-hidden="true" />,
        href: "/profile/saved-jobs"
    }
];

const Tools: React.FC = () => {
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
        <div className="container max-w-7xl mx-auto px-4 py-8 prose prose-neutral max-w-none">
            <Seo
                title="Gratis jobsøgningsværktøjer 2026 – CV-tjek, jobagent og mere | FindJob.nu"
                description="Brug vores gratis værktøjer til jobsøgning: CV-analyse, personlige jobanbefalinger, jobagent og mere. Alt du behøver for at finde dit næste job."
                path="/vaerktoejer"
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "CollectionPage",
                        name: "Gratis jobsøgningsværktøjer",
                        description: "Samling af gratis værktøjer til jobsøgende: CV-analyse, jobanbefalinger, jobagent og profil.",
                        url: "https://findjob.nu/vaerktoejer",
                        mainEntity: {
                            "@type": "ItemList",
                            itemListElement: tools.map((tool, i) => ({
                                "@type": "ListItem",
                                position: i + 1,
                                name: tool.title,
                                description: tool.description,
                                url: `https://findjob.nu${tool.href}`
                            }))
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "SoftwareApplication",
                        name: "FindJob.nu CV-analyse",
                        applicationCategory: "BusinessApplication",
                        operatingSystem: "Web",
                        offers: {
                            "@type": "Offer",
                            price: "0",
                            priceCurrency: "DKK"
                        },
                        description: "Gratis CV-analyse og ATS-tjek for jobsøgende"
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: [
                            {
                                "@type": "Question",
                                name: "Er værktøjerne gratis at bruge?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Ja, alle værktøjer på FindJob.nu er 100% gratis. Du kan lave CV-tjek, få jobanbefalinger og oprette jobagenter uden at betale."
                                }
                            },
                            {
                                "@type": "Question",
                                name: "Skal jeg oprette en konto for at bruge værktøjerne?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "CV-analyse kan bruges uden login. For personlige jobanbefalinger, jobagent og gemte job skal du oprette en gratis konto."
                                }
                            },
                            {
                                "@type": "Question",
                                name: "Gemmer I mit CV?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Nej, vi gemmer ikke dit CV. PDF-dokumentet analyseres i realtid og slettes automatisk efter analysen."
                                }
                            }
                        ]
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Forside", item: "https://findjob.nu/" },
                            { "@type": "ListItem", position: 2, name: "Værktøjer", item: "https://findjob.nu/vaerktoejer" }
                        ]
                    }
                ]}
            />

            <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-box shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 mb-10">
                <div className="hero-content text-center py-12">
                    <div className="max-w-6xl w-full">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <WrenchScrewdriverIcon className="w-10 h-10 text-primary" aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Gratis værktøjer til din jobsøgning
                        </h1>
                        <p className="text-base-content/70 mt-3 text-lg">
                            Alt hvad du behøver for at finde dit næste job – helt gratis. CV-analyse, personlige anbefalinger, jobagenter og meget mere.
                        </p>
                        <div className="mt-6 flex justify-center gap-2 flex-wrap">
                            <span className="badge badge-primary">100% Gratis</span>
                            <span className="badge badge-secondary badge-outline">Ingen skjulte omkostninger</span>
                            <span className="badge badge-accent badge-outline">Ingen reklamer</span>
                        </div>

                        <div className="mt-10">
                            <ProfileSetupStatus userId={userId} setupState={setupState} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.slug}
                        to={tool.href}
                        className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-lg border border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1"
                    >
                        <div className="card-body">
                            <div className="flex items-start justify-between">
                                <div className={`p-3 rounded-lg ${tool.highlight ? "bg-primary/10 text-primary" : "bg-base-200 text-base-content/80"}`}>
                                    {tool.icon}
                                </div>
                                {tool.badge && (
                                    <span className={`badge ${tool.highlight ? "badge-primary" : "badge-outline"}`}>
                                        {tool.badge}
                                    </span>
                                )}
                            </div>
                            <h2 className="card-title mt-4">{tool.title}</h2>
                            <p className="text-base-content/70">{tool.description}</p>
                            <ul className="mt-4 space-y-2">
                                {tool.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-2 text-sm text-base-content/80">
                                        <CheckCircleIcon className="w-4 h-4 text-success flex-shrink-0" aria-hidden="true" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <div className="card-actions mt-4">
                                <span className="link link-primary font-medium flex items-center gap-1">
                                    Prøv nu
                                    <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            <div className="mt-12 card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="card-body">
                    <div className="grid gap-8 lg:grid-cols-2 items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Hvorfor bruge FindJob.nu?</h2>
                            <p className="text-base-content/70 mt-2">
                                Vi har bygget værktøjerne, fordi vi selv savnede dem da vi søgte job. Ingen betalingsmure, ingen spam, ingen salg af dine data.
                            </p>
                            <ul className="mt-4 space-y-3">
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    <div>
                                        <span className="font-medium">100% gratis</span>
                                        <p className="text-sm text-base-content/70">Alle funktioner er gratis – nu og altid.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    <div>
                                        <span className="font-medium">Respekt for dit privatliv</span>
                                        <p className="text-sm text-base-content/70">Vi gemmer ikke dit CV og sælger ikke dine data.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3">
                                    <CheckCircleIcon className="w-5 h-5 text-success mt-0.5 flex-shrink-0" aria-hidden="true" />
                                    <div>
                                        <span className="font-medium">Bygget til danske jobsøgende</span>
                                        <p className="text-sm text-base-content/70">Fokuseret på det danske jobmarked og danske virksomheder.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="flex flex-col gap-4">
                            <Link to="/cv" className="btn btn-primary btn-lg">
                                Start med CV-tjek
                                <ArrowRightIcon className="w-5 h-5" aria-hidden="true" />
                            </Link>
                            <Link to="/register" className="btn btn-outline btn-lg">
                                Opret gratis konto
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-12">
                <h2 className="text-2xl font-bold mb-6">Ofte stillede spørgsmål</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box transition-all hover:shadow-xl hover:-translate-y-1">
                        <input type="radio" name="faq-accordion" aria-label="Er værktøjerne virkelig gratis?" defaultChecked />
                        <div className="collapse-title font-medium">
                            Er værktøjerne virkelig gratis?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>Ja, alle værktøjer er 100% gratis. Der er ingen betalingsmur, ingen premium-version, og ingen skjulte omkostninger.</p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box transition-all hover:shadow-xl hover:-translate-y-1">
                        <input type="radio" name="faq-accordion" aria-label="Hvad sker der med mit CV når jeg uploader det?" />
                        <div className="collapse-title font-medium">
                            Hvad sker der med mit CV når jeg uploader det?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>Dit CV analyseres i realtid og slettes automatisk bagefter. Vi gemmer hverken dokumentet eller dine personlige oplysninger.</p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box transition-all hover:shadow-xl hover:-translate-y-1">
                        <input type="radio" name="faq-accordion" aria-label="Hvordan virker jobanbefalingerne?" />
                        <div className="collapse-title font-medium">
                            Hvordan virker jobanbefalingerne?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>Vi matcher dine færdigheder og erfaringer med jobopslag. Jo mere du udfylder din profil, desto bedre bliver anbefalingerne.</p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box transition-all hover:shadow-xl hover:-translate-y-1">
                        <input type="radio" name="faq-accordion" aria-label="Kan jeg afmelde jobagenten?" />
                        <div className="collapse-title font-medium">
                            Kan jeg afmelde jobagenten?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>Ja, du kan til enhver tid slå jobagenten fra i din profil. Du kan også justere hvor ofte du vil have notifikationer.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tools;
