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

    const featuredToolCount = tools.filter((tool) => tool.highlight).length;
    const totalFeatureCount = tools.reduce((sum, tool) => sum + tool.features.length, 0);
    const setupProgressCount = [
        setupState.profileFound && (setupState.hasExperience || setupState.hasEducation || setupState.hasSkills),
        setupState.hasSkills && setupState.hasTopKeywords,
        setupState.hasJobAgent,
        setupState.hasConnections,
    ].filter(Boolean).length;

    const secondaryHeroCta = userId
        ? { href: "/jobsearch?panel=recommended", label: "Se anbefalede jobs" }
        : { href: "/register", label: "Opret gratis konto" };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 prose prose-neutral">
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
            <div className="not-prose space-y-10">
                <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_52%)]" />
                    <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

                    <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-stretch lg:p-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                                <WrenchScrewdriverIcon className="h-4 w-4" aria-hidden="true" />
                                Værktøjer til jobsøgning
                            </div>

                            <div className="space-y-3">
                                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-[2.9rem]">
                                    Gratis værktøjer, der gør din jobsøgning skarpere
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-base-content/72 sm:text-lg">
                                    CV-analyse, personlige anbefalinger, jobagent og profilværktøjer samlet i et mere overskueligt flow. Alt er gratis, og alt er bygget til danske jobsøgende.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm text-base-content/72">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1.5 shadow-sm">
                                    100% gratis
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">
                                    Ingen skjulte omkostninger
                                </span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">
                                    Ingen reklamer eller spam
                                </span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Værktøjer</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">{tools.length}</p>
                                    <p className="text-sm text-base-content/65">samlet i ét sted</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Udvalgte</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">{featuredToolCount}</p>
                                    <p className="text-sm text-base-content/65">personlige genveje</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Hjælpetrin</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">{totalFeatureCount}+</p>
                                    <p className="text-sm text-base-content/65">
                                        {userId ? `${setupProgressCount}/4 statuspunkter opfyldt` : "klar uden betalingsmur"}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <Link to="/cv" className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20">
                                    Start med CV-tjek
                                    <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                                </Link>
                                <Link to={secondaryHeroCta.href} className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/80 bg-base-100/75 px-6 shadow-sm">
                                    {secondaryHeroCta.label}
                                </Link>
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/80 p-4 shadow-lg backdrop-blur-xl sm:p-5">
                            <div className="mb-4 space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Din status</p>
                                <h2 className="text-2xl font-semibold tracking-tight text-base-content">
                                    {userId ? "Så tæt er du på bedre anbefalinger" : "Log ind og lås op for personlige værktøjer"}
                                </h2>
                                <p className="text-sm leading-6 text-base-content/68">
                                    {userId
                                        ? "Brug statuskortet til at se, hvor du kan forbedre din profil og få skarpere jobmatch hurtigere."
                                        : "Du kan bruge flere af værktøjerne uden konto, men login giver adgang til gemte job, anbefalinger og jobagent."}
                                </p>
                            </div>

                            <div className="rounded-[1.5rem] border border-base-300/70 bg-gradient-to-br from-base-100 to-primary/5 shadow-inner shadow-base-content/5">
                                <ProfileSetupStatus userId={userId} setupState={setupState} />
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Værktøjer</p>
                            <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Vælg det værktøj, der hjælper dig videre lige nu</h2>
                            <p className="max-w-2xl text-base leading-7 text-base-content/70">
                                Hvert kort er gjort tydeligere og lettere at skimme, så du hurtigere kan vælge mellem CV-tjek, jobanbefalinger, jobagent og profilværktøjer.
                            </p>
                        </div>

                        <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 px-4 py-3 shadow-sm">
                            <p className="text-sm text-base-content/65">Start med det vigtigste først: CV, profil og derefter anbefalinger.</p>
                        </div>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {tools.map((tool, index) => (
                            <Link
                                key={tool.slug}
                                to={tool.href}
                                className={`group relative overflow-hidden rounded-[1.75rem] border p-0 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.58)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_72px_-42px_rgba(15,23,42,0.64)] ${tool.highlight
                                    ? "border-primary/20 bg-gradient-to-br from-base-100 via-primary/6 to-secondary/10"
                                    : "border-base-300/70 bg-gradient-to-br from-base-100 via-base-100 to-base-200/45"}`}
                            >
                                <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_58%)]" />

                                <div className="relative flex h-full flex-col p-5 sm:p-6">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className={`inline-flex h-14 w-14 items-center justify-center rounded-2xl border ${tool.highlight
                                            ? "border-primary/15 bg-primary/10 text-primary"
                                            : "border-base-300/70 bg-base-100/80 text-base-content/80"}`}>
                                            {tool.icon}
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span className="rounded-full border border-base-300/70 bg-base-100/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                            {tool.badge && (
                                                <span className={`badge h-auto px-3 py-2 text-xs font-semibold ${tool.highlight ? "badge-primary" : "badge-outline"}`}>
                                                    {tool.badge}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5 space-y-3">
                                        <h3 className="text-xl font-semibold leading-tight text-base-content sm:text-2xl">{tool.title}</h3>
                                        <p className="text-base leading-7 text-base-content/72">{tool.description}</p>
                                    </div>

                                    <ul className="mt-5 space-y-3">
                                        {tool.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-3 text-sm leading-6 text-base-content/78 sm:text-base">
                                                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>

                                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-base-300/70 pt-5">
                                        <span className="text-sm text-base-content/58">{tool.features.length} konkrete fordele</span>
                                        <span className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-base-100/80 px-4 py-2 text-sm font-medium text-primary transition group-hover:bg-primary/10">
                                            Prøv nu
                                            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </section>

                <section className="rounded-[1.9rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 p-5 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.5)] sm:p-6 lg:p-8">
                    <div className="grid gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(280px,0.9fr)] lg:items-center">
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Hvorfor FindJob.nu</p>
                                <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Bygget til jobsøgende, ikke til betalingsmure</h2>
                                <p className="max-w-2xl text-base leading-7 text-base-content/72">
                                    Vi byggede værktøjerne, fordi vi selv manglede dem i en rigtig jobsøgning. Derfor er oplevelsen gjort enklere, mere gennemsigtig og mere brugbar fra første klik.
                                </p>
                            </div>

                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Pris</p>
                                    <p className="mt-2 text-xl font-semibold text-base-content">0 kr.</p>
                                    <p className="text-sm text-base-content/65">ingen premium-lås</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Privatliv</p>
                                    <p className="mt-2 text-xl font-semibold text-base-content">Respekt først</p>
                                    <p className="text-sm text-base-content/65">ingen salg af data</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Fokus</p>
                                    <p className="mt-2 text-xl font-semibold text-base-content">Danmark</p>
                                    <p className="text-sm text-base-content/65">bygget til danske job</p>
                                </div>
                            </div>

                            <ul className="space-y-4">
                                <li className="flex items-start gap-3 rounded-[1.25rem] border border-base-300/70 bg-base-100/70 p-4 shadow-sm">
                                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                    <div>
                                        <span className="font-medium text-base-content">100% gratis</span>
                                        <p className="mt-1 text-sm leading-6 text-base-content/68">Alle funktioner er gratis nu og fremover, så du ikke skal vælge mellem hjælp og budget.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 rounded-[1.25rem] border border-base-300/70 bg-base-100/70 p-4 shadow-sm">
                                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                    <div>
                                        <span className="font-medium text-base-content">Respekt for dit privatliv</span>
                                        <p className="mt-1 text-sm leading-6 text-base-content/68">Vi gemmer ikke dit CV unødigt og bygger ikke forretningen på at videresælge dine oplysninger.</p>
                                    </div>
                                </li>
                                <li className="flex items-start gap-3 rounded-[1.25rem] border border-base-300/70 bg-base-100/70 p-4 shadow-sm">
                                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                    <div>
                                        <span className="font-medium text-base-content">Bygget til danske jobsøgende</span>
                                        <p className="mt-1 text-sm leading-6 text-base-content/68">Sprog, flows og jobmatch er tilpasset det danske jobmarked og de virksomheder, du faktisk søger hos.</p>
                                    </div>
                                </li>
                            </ul>
                        </div>

                        <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/82 p-5 shadow-lg backdrop-blur-xl">
                            <div className="space-y-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Kom i gang</p>
                                <h3 className="text-2xl font-semibold tracking-tight text-base-content">Vælg din næste handling</h3>
                                <p className="text-base leading-7 text-base-content/70">Hvis du vil have mest ud af platformen, så begynd med CV og profil, og brug derefter jobanbefalinger og jobagent til at holde momentum.</p>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <Link to="/cv" className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20">
                                    Start med CV-tjek
                                    <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                                </Link>
                                <Link to="/register" className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/80 bg-base-100/75 px-6 shadow-sm">
                                    Opret gratis konto
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">FAQ</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Ofte stillede spørgsmål</h2>
                        <p className="max-w-2xl text-base leading-7 text-base-content/70">
                            Her er de korte svar på de spørgsmål, der oftest kommer, når man vil i gang med værktøjerne.
                        </p>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="collapse collapse-arrow rounded-[1.5rem] border border-base-300/70 bg-base-100/85 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                            <input type="radio" name="faq-accordion" aria-label="Er værktøjerne virkelig gratis?" defaultChecked />
                            <div className="collapse-title text-lg font-semibold">
                                Er værktøjerne virkelig gratis?
                            </div>
                            <div className="collapse-content text-base leading-7 text-base-content/70">
                                <p>Ja, alle værktøjer er 100% gratis. Der er ingen betalingsmur, ingen premium-version, og ingen skjulte omkostninger.</p>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow rounded-[1.5rem] border border-base-300/70 bg-base-100/85 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                            <input type="radio" name="faq-accordion" aria-label="Hvad sker der med mit CV når jeg uploader det?" />
                            <div className="collapse-title text-lg font-semibold">
                                Hvad sker der med mit CV når jeg uploader det?
                            </div>
                            <div className="collapse-content text-base leading-7 text-base-content/70">
                                <p>Dit CV analyseres i realtid og slettes automatisk bagefter. Vi gemmer hverken dokumentet eller dine personlige oplysninger.</p>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow rounded-[1.5rem] border border-base-300/70 bg-base-100/85 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                            <input type="radio" name="faq-accordion" aria-label="Hvordan virker jobanbefalingerne?" />
                            <div className="collapse-title text-lg font-semibold">
                                Hvordan virker jobanbefalingerne?
                            </div>
                            <div className="collapse-content text-base leading-7 text-base-content/70">
                                <p>Vi matcher dine færdigheder og erfaringer med jobopslag. Jo mere du udfylder din profil, desto bedre bliver anbefalingerne.</p>
                            </div>
                        </div>
                        <div className="collapse collapse-arrow rounded-[1.5rem] border border-base-300/70 bg-base-100/85 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                            <input type="radio" name="faq-accordion" aria-label="Kan jeg afmelde jobagenten?" />
                            <div className="collapse-title text-lg font-semibold">
                                Kan jeg afmelde jobagenten?
                            </div>
                            <div className="collapse-content text-base leading-7 text-base-content/70">
                                <p>Ja, du kan til enhver tid slå jobagenten fra i din profil. Du kan også justere hvor ofte du vil have notifikationer.</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Tools;
