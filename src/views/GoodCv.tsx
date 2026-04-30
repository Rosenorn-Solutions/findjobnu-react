import React, { useState } from "react";
import {
    DocumentCheckIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    ShieldCheckIcon,
    BookOpenIcon,
    QuestionMarkCircleIcon,
    CheckCircleIcon,
    ArrowRightIcon,
} from "@heroicons/react/24/outline";
import illuFileSearch from "../assets/illustrations/undraw_file-search_cbur.svg";
import illuPersonalInformation from "../assets/illustrations/undraw_personal-information_h7kf.svg";
import illuCertification from "../assets/illustrations/undraw_certification_i2m0.svg";
import { CVApi } from "../findjobnu-api";
import type { CvReadabilityResult } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import { useUser } from "../context/UserContext.shared";
import { handleApiError } from "../helpers/ErrorHelper";
import MetricCard from "../components/MetricCard";
import Seo from "../components/Seo";

type Section = {
    title: string;
    text: string;
    bullets: string[];
    image: string;
    imageAlt: string;
    badges: string[];
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const sections: Section[] = [
    {
        title: "Gør det klart, kort og målrettet",
        text:
            "Brug en enkel, letlæselig struktur med tydelige sektioner (Profil, Erfaring, Uddannelse, Kompetencer). Fremhæv resultater og effekt frem for opgaver, og målret nøgleord til det specifikke job. Et godt CV er ikke en jobbeskrivelse – det er et salgsværktøj, der demonstrerer din værdi gennem konkrete resultater. Tænk på hver sektion som en mulighed for at vise, hvordan du har gjort en forskel i tidligere stillinger. ATS-systemer (Applicant Tracking Systems) scanner efter nøgleord fra jobopslaget, så vær sikker på at inkludere relevante termer naturligt i din tekst. Samtidig skal CV'et være så læsevenligt for mennesker, at en rekrutterer kan forstå din værdi på under 30 sekunder.",
        bullets: [
            "Brug handleverber og kvantificér effekten (fx 'Øgede konvertering med 18%', 'Reducerede omkostninger med 250.000 kr årligt', 'Ledede team på 8 udviklere')",
            "Undgå tekstvægge – brug punktopstilling (4–6 pr. rolle) og hold hver linje til max 1-2 linjer",
            "Tilpas til hver ansøgning for bedre ATS-match – spejl nøgleord fra jobopslaget, men vær autentisk",
            "Start hver bullet med et stærkt handelsverbum: 'Implementerede', 'Optimerede', 'Udviklede', 'Ledede', 'Analyserede'",
            "Prioritér de seneste 10 års erfaring – ældre roller kan nævnes kort eller udelades",
            "Brug tal og procenter hvor muligt – konkrete resultater skiller sig ud",
        ],
        image: illuFileSearch,
        imageAlt: "Screening af CV'er illustration",
        badges: ["Klarhed", "Relevans", "Præcision"],
        icon: SparklesIcon,
    },
    {
        title: "Lad den øverste tredjedel gøre arbejdet",
        text:
            "Rekrutterere skimmer. Læg dit stærkeste budskab øverst: en skarp profilsætning, dine 3–5 vigtigste kompetencer og seneste stilling. Hold kontaktinfo kort og professionel (mail, telefon, LinkedIn). Undersøgelser viser, at rekrutterere i gennemsnit bruger 6-7 sekunder på første gennemlæsning af et CV. Derfor er de øverste 5-8 cm af din første side kritisk – det er her du skal fange opmærksomheden. Din profilsætning skal være målrettet den specifikke stilling og branche, ikke en generisk beskrivelse. Tænk på det som dit 'elevator pitch' på skrift. Kompetencesektionen skal liste hårde færdigheder først (tekniske skills, programmer, certifikationer), da disse ofte er ATS-søgekriterier. Kontaktinfo skal være opdateret og professionel – undgå uprofessionelle emailadresser eller forældede telefonnumre.",
        bullets: [
            "Skriv en 2–3 linjers profil, der matcher jobbet præcist og fremhæver din unikke værdi",
            "Indsæt relevante nøgleord naturligt i profilsætningen – både tekniske skills og soft skills fra jobopslaget",
            "Link til portfolio/GitHub når relevant – især vigtigt for kreative og tekniske roller",
            "Placer dine stærkeste kompetencer øverst i synligt format – overvej en 'Nøglekompetencer'-sektion",
            "Brug LinkedIn URL (custom URL er mest professionelt) frem for fulde sociale medier profiler",
            "Undgå unødvendige detaljer som alder, civilstand, eller billede (medmindre branchekrav)",
            "Gør din seneste stillingsbeskrivelse ekstra stærk – det er ofte det første, rekrutterere læser grundigt",
        ],
        image: illuCertification,
        imageAlt: "Profil og nøgleord illustration",
        badges: ["Skimning", "Nøgleord", "Profil"],
        icon: ArrowTrendingUpIcon,
    },
    {
        title: "Finpuds læsbarhed og troværdighed",
        text:
            "Konsistens skaber tillid. Brug samme tid, datoformat og opstilling gennem hele CV'et. Undgå buzzwords, klichéer og stavefejl. Gem som PDF med læsevenlige skrifter og god kontrast. Et professionelt CV handler ikke kun om indhold, men også om præsentation. Små inkonsistenser i formatering får rekrutterere til at tvivle på din omhu og professionalisme. Stavefejl er dealbreakers – de signalerer manglende grundighed. Brug moderne, professionelle skrifter som Calibri, Arial, eller Helvetica i stedet for forældede valg som Times New Roman eller Comic Sans. God kontrast mellem tekst og baggrund er essentiel både for læsbarhed og ATS-kompatibilitet. PDF-format sikrer, at dit layout ser identisk ud på alle enheder og ikke bliver ødelagt af forskellige Word-versioner eller operativsystemer.",
        bullets: [
            "Hold dig til én skrifttype og konsekvent spacing – samme fontstørrelse for alle headers på samme niveau",
            "Foretræk omvendt kronologisk rækkefølge – seneste først, både for jobs og uddannelse",
            "Korrekturlæs – små fejl kan koste samtalen. Brug både spellcheck og få en anden til at læse det",
            "Brug konsekvent datoformat gennem hele dokumentet (fx 'Jan 2023 - Dec 2024' eller '01/2023 - 12/2024')",
            "Sørg for ensartet brug af store/små bogstaver i overskrifter og stillingstitler",
            "Undgå klichéer som 'teamplayer', 'passioneret', 'detaljeorienteret' – vis det i stedet gennem eksempler",
            "Hold marginer mellem 1,5-2,5 cm for optimal læsbarhed og professionelt udseende",
            "Test PDF'en på forskellige enheder for at sikre, at al tekst er læselig og formatering holder",
        ],
        image: illuPersonalInformation,
        imageAlt: "Kvalitet og konsistens illustration",
        badges: ["Kvalitet", "Konsistens", "Læsbarhed"],
        icon: ShieldCheckIcon,
    },
];

const resources = [
    {
        source: "UK National Careers Service",
        title: "How to write a CV",
        href: "https://nationalcareers.service.gov.uk/careers-advice/cv-sections",
        domain: "nationalcareers.service.gov.uk",
    },
    {
        source: "Harvard OCS",
        title: "Resume and Cover Letters",
        href: "https://ocs.fas.harvard.edu/resumes-cvs",
        domain: "ocs.fas.harvard.edu",
    },
    {
        source: "EU Europass",
        title: "Europass CV guidance",
        href: "https://europa.eu/europass/en/create-europass-cv",
        domain: "europa.eu",
    },
    {
        source: "LinkedIn",
        title: "Tips to make your resume stand out",
        href: "https://www.linkedin.com/advice/0/how-do-you-make-your-resume-stand-out",
        domain: "linkedin.com",
    },
] as const;

const GoodCv: React.FC = () => {
    const { user } = useUser();
    const token = user?.accessToken ?? null;
    const [file, setFile] = useState<File | null>(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [result, setResult] = useState<CvReadabilityResult | null>(null);
    const [error, setError] = useState<string | null>(null);

    const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.target.files?.[0] ?? null;
        setFile(f);
        setResult(null);
        setError(null);
    };

    const onAnalyze = async () => {
        if (!file) return;
        setAnalyzing(true);
        setError(null);
        try {
            const api = createApiClient<CVApi>(CVApi, token ?? undefined);
            const res = await api.analyzeCvPdf({ file });
            setResult(res);
        } catch (err) {
            const info = await handleApiError(err);
            setError(info.message);
        } finally {
            setAnalyzing(false);
        }
    };

    const readabilityScorePercent = result
        ? ((result.readabilityScore ?? 0) <= 1
            ? Math.round((result.readabilityScore ?? 0) * 100)
            : Math.round(result.readabilityScore ?? 0))
        : 0;
    const totalTips = sections.reduce((sum, section) => sum + section.bullets.length, 0);

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 prose prose-neutral">
            <Seo
                title="Gratis CV-tjek og ATS-guide 2026 – Få din PDF analyseret | FindJob.nu"
                description="Upload dit CV og få gratis læsbarheds-score, ATS-tjek og konkrete tips. Lær hvordan du skriver et CV der bliver set af rekrutterere."
                path="/cv"
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "Article",
                        headline: "Det gode CV – Sådan skriver du et ATS-venligt CV",
                        description: "Komplet guide til at skrive et CV der scorer højt i Applicant Tracking Systems og bliver læst af rekrutterere.",
                        author: {
                            "@type": "Organization",
                            name: "FindJob.nu"
                        },
                        publisher: {
                            "@type": "Organization",
                            name: "FindJob.nu",
                            url: "https://findjob.nu"
                        },
                        mainEntityOfPage: "https://findjob.nu/cv",
                        datePublished: "2024-01-01",
                        dateModified: "2026-01-09"
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        name: "Sådan skriver du et ATS-venligt CV",
                        description: "Trin-for-trin guide til at skrive et CV der klarer sig godt i ATS-systemer og fanger rekruttereres opmærksomhed.",
                        totalTime: "PT30M",
                        tool: [
                            { "@type": "HowToTool", name: "PDF-editor eller Word" },
                            { "@type": "HowToTool", name: "FindJob.nu CV-analyse" }
                        ],
                        step: [
                            {
                                "@type": "HowToStep",
                                name: "Gør det klart, kort og målrettet",
                                text: "Brug en enkel, letlæselig struktur med tydelige sektioner. Fremhæv resultater frem for opgaver.",
                                position: 1
                            },
                            {
                                "@type": "HowToStep",
                                name: "Optimer den øverste tredjedel",
                                text: "Læg dit stærkeste budskab øverst: en skarp profilsætning og dine vigtigste kompetencer.",
                                position: 2
                            },
                            {
                                "@type": "HowToStep",
                                name: "Finpuds læsbarhed og troværdighed",
                                text: "Brug konsistent formatering, undgå stavefejl, og gem som PDF med læsevenlige skrifter.",
                                position: 3
                            },
                            {
                                "@type": "HowToStep",
                                name: "Test dit CV med vores gratis analyse",
                                text: "Upload din PDF og få en læsbarhedsscore samt konkrete forbedringsforslag.",
                                position: 4
                            }
                        ]
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        mainEntity: [
                            {
                                "@type": "Question",
                                name: "Hvad er et ATS-venligt CV?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Et ATS-venligt CV er formateret så Applicant Tracking Systems kan læse og parse indholdet korrekt. Det betyder klar struktur, standard sektioner, og relevante nøgleord."
                                }
                            },
                            {
                                "@type": "Question",
                                name: "Hvordan tester jeg om mit CV er ATS-venligt?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Upload dit CV som PDF på FindJob.nu og få en gratis læsbarheds-analyse med score og konkrete forbedringsforslag."
                                }
                            },
                            {
                                "@type": "Question",
                                name: "Hvor langt skal et CV være?",
                                acceptedAnswer: {
                                    "@type": "Answer",
                                    text: "Et CV bør typisk være 1-2 sider. Fokuser på de mest relevante erfaringer og kompetencer for den stilling du søger."
                                }
                            }
                        ]
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
                                name: "Gratis CV-tjek",
                                item: "https://findjob.nu/cv"
                            }
                        ]
                    }
                ]}
            />
            <div className="not-prose space-y-10">
                <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_52%)]" />
                    <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

                    <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.05fr)_minmax(320px,0.95fr)] lg:p-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                                <DocumentCheckIcon className="h-4 w-4" aria-hidden="true" />
                                Gratis CV-tjek
                            </div>

                            <div className="space-y-3">
                                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-[2.9rem]">
                                    Gør dit CV lettere at læse, lettere at matche og lettere at huske
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-base-content/72 sm:text-lg">
                                    Brug guiden her til at skrive et skarpere CV, og test derefter din PDF direkte på siden. Målet er et CV, der både fungerer for rekrutterere og ATS-systemer.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm text-base-content/72">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1.5 shadow-sm">ATS-venligt</span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">Let at skimme</span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">Resultatfokus</span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Guideområder</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">{sections.length}</p>
                                    <p className="text-sm text-base-content/65">centrale trin</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Råd</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">{totalTips}+</p>
                                    <p className="text-sm text-base-content/65">konkrete forbedringer</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Analyse</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">Gratis</p>
                                    <p className="text-sm text-base-content/65">PDF-upload og score</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <a href="#cv-analyzer" className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20">
                                    Analysér dit CV
                                    <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                                </a>
                                <a href="#cv-guide" className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/80 bg-base-100/75 px-6 shadow-sm">
                                    Se guidens 3 trin
                                </a>
                            </div>
                        </div>

                        <div id="cv-analyzer" className="rounded-[1.75rem] border border-base-300/70 bg-base-100/82 p-4 shadow-lg backdrop-blur-xl sm:p-5">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Gratis PDF-analyse</p>
                                <h2 className="text-2xl font-semibold tracking-tight text-base-content">
                                    Tjek læsbarheden af dit CV (PDF)
                                </h2>
                                <p className="text-sm leading-6 text-base-content/68">
                                    Upload din PDF og få en hurtig score, nøglemålinger og et overblik over, hvor godt dokumentet står til både ATS og menneskelig skimning.
                                </p>
                            </div>

                            <div className="mt-5 rounded-[1.5rem] border border-base-300/70 bg-gradient-to-br from-base-100 to-primary/5 p-4 shadow-inner shadow-base-content/5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <label htmlFor="goodCvFileInput" className="text-sm font-semibold text-base-content">Upload CV som PDF</label>
                                        <p className="mt-1 text-sm leading-6 text-base-content/65">Vi analyserer format, struktur og læsbarhed uden at gemme dokumentet bagefter.</p>
                                    </div>
                                    <button
                                        type="button"
                                        className="tooltip tooltip-left"
                                        data-tip="Vi gemmer ikke pdf-dokument og/eller dine oplysninger. Score og data-udtræk slettes automatisk efter analyse."
                                        aria-label="Hjælp til CV-analyse"
                                    >
                                        <QuestionMarkCircleIcon
                                            className="h-5 w-5 text-base-content/60 hover:text-base-content"
                                            aria-label="Hjælp"
                                        />
                                    </button>
                                </div>

                                <div className="mt-4 flex flex-col gap-3">
                                    <input
                                        id="goodCvFileInput"
                                        type="file"
                                        accept="application/pdf"
                                        className="file-input file-input-bordered w-full rounded-2xl"
                                        onChange={onFileChange}
                                        aria-label="Upload CV som PDF"
                                    />
                                    {file && (
                                        <p className="text-sm text-base-content/65">Valgt fil: {file.name}</p>
                                    )}
                                    <button
                                        className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20"
                                        onClick={onAnalyze}
                                        disabled={!file || analyzing}
                                    >
                                        {analyzing ? "Analyserer…" : "Analyser CV"}
                                    </button>
                                </div>

                                {error && (
                                    <div className="alert alert-error mt-4 rounded-2xl">
                                        <span>{error}</span>
                                    </div>
                                )}

                                {result ? (
                                    <div className="mt-6 space-y-5">
                                        <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/85 p-4 shadow-sm">
                                            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                                <span className="text-base font-semibold text-base-content">Læsbarhedsscore:</span>
                                                <div className="flex flex-col gap-2 sm:min-w-[14rem]">
                                                    <progress
                                                        className="progress progress-primary h-3 w-full"
                                                        value={readabilityScorePercent}
                                                        max={100}
                                                    />
                                                    <div className="flex items-center justify-between gap-3 text-sm text-base-content/68">
                                                        <span>ATS og menneskelig skimning</span>
                                                        <span className="font-semibold text-base-content">{readabilityScorePercent}%</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {result.summary && (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between gap-3">
                                                    <div>
                                                        <div className="text-base font-semibold text-base-content">Opsummering</div>
                                                        <p className="text-sm text-base-content/65">Et hurtigt overblik over de vigtigste signaler i din PDF.</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                                                    {typeof result.summary.totalWords === 'number' && (
                                                        <MetricCard
                                                            label="Ord i alt"
                                                            tooltip="Antal ord udtrukket fra PDF'en."
                                                            value={result.summary.totalWords}
                                                            ok={(result.summary.totalWords ?? 0) >= 150}
                                                        />
                                                    )}
                                                    {typeof result.summary.totalChars === 'number' && (
                                                        <MetricCard
                                                            label="Tegn i alt"
                                                            tooltip="Antal tegn inkl. mellemrum."
                                                            value={result.summary.totalChars}
                                                            ok={true}
                                                        />
                                                    )}
                                                    {typeof result.summary.totalLines === 'number' && (
                                                        <MetricCard
                                                            label="Linjer i alt"
                                                            tooltip="Antal linjer i dokumentet."
                                                            value={result.summary.totalLines}
                                                            ok={true}
                                                        />
                                                    )}
                                                    {typeof result.summary.bulletCount === 'number' && (
                                                        <MetricCard
                                                            label="Punkter (bullets)"
                                                            tooltip="Antal punktopstillinger (• eller -)."
                                                            value={result.summary.bulletCount}
                                                            ok={(result.summary.bulletCount ?? 0) >= 5}
                                                        />
                                                    )}
                                                    {typeof result.summary.matchedSections === 'number' && (
                                                        <MetricCard
                                                            label="Matchede sektioner"
                                                            tooltip="Antal genkendte CV-sektioner (fx Profil, Erfaring, Uddannelse)."
                                                            value={result.summary.matchedSections}
                                                            ok={(result.summary.matchedSections ?? 0) >= 3}
                                                        />
                                                    )}
                                                    {typeof result.summary.hasEmail === 'boolean' && (
                                                        <MetricCard
                                                            label="Har e-mail"
                                                            tooltip="Om der blev fundet en gyldig e-mailadresse."
                                                            value={result.summary.hasEmail ? 'Ja' : 'Nej'}
                                                            ok={!!result.summary.hasEmail}
                                                        />
                                                    )}
                                                    {typeof result.summary.hasPhone === 'boolean' && (
                                                        <MetricCard
                                                            label="Har telefon"
                                                            tooltip="Om der blev fundet et telefonnummer."
                                                            value={result.summary.hasPhone ? 'Ja' : 'Nej'}
                                                            ok={!!result.summary.hasPhone}
                                                        />
                                                    )}
                                                </div>

                                                {result.summary.note && (
                                                    <p className="rounded-[1.25rem] border border-base-300/70 bg-base-100/78 px-4 py-3 text-sm leading-6 text-base-content/70">
                                                        {result.summary.note}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {result.extractedText && (
                                            <details className="collapse collapse-arrow rounded-[1.35rem] border border-base-300/70 bg-base-100/82 shadow-sm">
                                                <summary className="collapse-title text-base font-semibold">Vis udtrukket tekst</summary>
                                                <div className="collapse-content">
                                                    <pre className="whitespace-pre-wrap text-sm leading-6 text-base-content/80">{result.extractedText}</pre>
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                ) : (
                                    <div className="mt-6 rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                        <p className="text-sm font-semibold text-base-content">Hvad du får med analysen</p>
                                        <ul className="mt-3 space-y-3">
                                            <li className="flex items-start gap-3 text-sm leading-6 text-base-content/70">
                                                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                                <span>En læsbarhedsscore, der hurtigt viser hvor stærkt dit CV står.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm leading-6 text-base-content/70">
                                                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                                <span>Målinger på ord, linjer, punkter og genkendelige sektioner.</span>
                                            </li>
                                            <li className="flex items-start gap-3 text-sm leading-6 text-base-content/70">
                                                <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                                <span>Et klart udgangspunkt for at justere CV'et, før du sender det afsted.</span>
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section id="cv-guide" className="space-y-5">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Guide</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Tre praktiske trin til et stærkere CV</h2>
                        <p className="max-w-2xl text-base leading-7 text-base-content/70">
                            De samme principper går igen i de bedste CV'er: klar struktur, stærk topsektion og konsekvent præsentation. Her er dem brudt ned i en form, der er lettere at arbejde med.
                        </p>
                    </div>

                    <div className="space-y-5">
                        {sections.map((s, i) => (
                            <article
                                key={s.title}
                                className="overflow-hidden rounded-[1.9rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.52)]"
                            >
                                <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(260px,0.72fr)] lg:items-center">
                                    <div className={`${i % 2 === 1 ? "lg:order-2" : ""} space-y-5`}>
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-primary">
                                                Trin {String(i + 1).padStart(2, "0")}
                                            </span>
                                            {s.badges.map((badge) => (
                                                <span key={`${s.title}-${badge}`} className="rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1 text-xs font-medium text-base-content/65">
                                                    {badge}
                                                </span>
                                            ))}
                                        </div>

                                        <div className="flex items-start justify-between gap-3">
                                            <h2 className="text-2xl font-semibold leading-tight text-base-content sm:text-[2rem]">{s.title}</h2>
                                            <div className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                                <s.icon className="h-6 w-6" aria-hidden="true" />
                                            </div>
                                        </div>

                                        <p className="text-base leading-7 text-base-content/72">{s.text}</p>

                                        <ul className="space-y-3">
                                            {s.bullets.map((b) => (
                                                <li key={`${s.title}-${b}`} className="flex items-start gap-3 text-sm leading-7 text-base-content/78 sm:text-base">
                                                    <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                                    <span>{b}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div className={`${i % 2 === 1 ? "lg:order-1" : ""}`}>
                                        <figure className="rounded-[1.6rem] border border-base-300/70 bg-base-100/82 p-5 text-center shadow-lg">
                                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">Visuelt fokus</p>
                                            <img
                                                src={s.image}
                                                alt={s.imageAlt}
                                                className="mx-auto w-full max-h-64 object-contain sm:max-h-72"
                                                loading="lazy"
                                            />
                                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                                {s.badges.map((badge) => (
                                                    <span key={`${s.imageAlt}-${badge}`} className="rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1 text-xs font-medium text-base-content/65">
                                                        {badge}
                                                    </span>
                                                ))}
                                            </div>
                                        </figure>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>

                <section className="rounded-[1.9rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 p-5 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.5)] sm:p-6 lg:p-8">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Kilder</p>
                            <h3 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Yderligere læsning og kilder</h3>
                            <p className="max-w-2xl text-base leading-7 text-base-content/70">
                                Hvis du vil gå dybere, er her nogle af de mest brugbare kilder om CV-struktur, ATS-kompatibilitet og professionel præsentation.
                            </p>
                        </div>

                        <a href="#cv-analyzer" className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/80 bg-base-100/75 px-6 shadow-sm">
                            Test dit CV nu
                            <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                        </a>
                    </div>

                    <div className="mt-6 grid gap-4 md:grid-cols-2">
                        {resources.map((resource) => (
                            <a
                                key={resource.href}
                                href={resource.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group rounded-[1.5rem] border border-base-300/70 bg-base-100/82 p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div>
                                        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">{resource.source}</p>
                                        <h4 className="mt-2 text-xl font-semibold text-base-content">{resource.title}</h4>
                                    </div>
                                    <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                        <BookOpenIcon className="h-5 w-5" aria-hidden="true" />
                                    </div>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-base-content/65">{resource.domain}</p>
                                <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                                    Åbn kilde
                                    <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
                                </span>
                            </a>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default GoodCv;
