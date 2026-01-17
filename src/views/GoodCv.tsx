import React, { useState } from "react";
import {
    DocumentCheckIcon,
    SparklesIcon,
    ArrowTrendingUpIcon,
    ShieldCheckIcon,
    BookOpenIcon,
    QuestionMarkCircleIcon,
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

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
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
            <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-box shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 mb-10">
                <div className="hero-content text-center py-12">
                    <div className="max-w-3xl">
                        <div className="flex items-center justify-center gap-2 mb-4">
                            <DocumentCheckIcon className="w-10 h-10 text-primary" aria-hidden="true" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold">
                            Det gode CV
                        </h1>
                        <p className="text-base-content/70 mt-3 text-lg">
                            Kort, målrettet og let at skimme. Brug tipsene her for at blive kaldt hurtigere til samtale – og for at klare dig bedre i ATS'er (Applicant Tracking System).
                        </p>
                        <div className="mt-6 flex justify-center gap-2 flex-wrap">
                            <span className="badge badge-primary">ATS-venligt</span>
                            <span className="badge badge-secondary badge-outline">Let at læse</span>
                            <span className="badge badge-accent badge-outline">Resultatfokus</span>
                        </div>

                        <div className="mt-6 text-center">
                            <div className="rounded-box p-4">
                                <h2 className="text-lg font-semibold flex items-center justify-center gap-1">
                                    <span>Tjek læsbarheden af dit CV (PDF)</span>
                                    <button
                                        type="button"
                                        className="tooltip tooltip-left"
                                        data-tip="Vi gemmer ikke pdf-dokument og/eller dine oplysninger. Score og data-udtræk slettes automatisk efter analyse."
                                        aria-label="Hjælp til Min Profil"
                                    >
                                        <QuestionMarkCircleIcon
                                            className="w-5 h-5 text-base-content/60 hover:text-base-content"
                                            aria-label="Hjælp"
                                        />
                                    </button>
                                </h2>
                                <div className="mt-3 flex flex-col md:flex-row md:items-center md:justify-center gap-3">
                                    <div className="form-control w-full md:w-auto">
                                        <span className="text-sm font-medium mb-1 block text-center">Upload CV som PDF</span>
                                        <div className="flex flex-col md:flex-row gap-3 items-center justify-center">
                                            <input
                                                id="goodCvFileInput"
                                                type="file"
                                                accept="application/pdf"
                                                className="file-input file-input-bordered w-full md:w-auto"
                                                onChange={onFileChange}
                                                aria-label="Upload CV som PDF"
                                            />
                                            <button
                                                className="btn btn-primary"
                                                onClick={onAnalyze}
                                                disabled={!file || analyzing}
                                            >
                                                {analyzing ? "Analyserer…" : "Analyser CV"}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {error && (
                                    <div className="alert alert-error mt-3">
                                        <span>{error}</span>
                                    </div>
                                )}

                                {result && (
                                    <div className="mt-4 grid gap-3">
                                        <div className="flex items-center text-center gap-3">
                                            <span className="font-medium">Læsbarhedsscore:</span>
                                            <div className="flex items-center gap-2">
                                                <progress
                                                    className="progress progress-primary w-48"
                                                    value={(result.readabilityScore ?? 0) <= 1 ? Math.round(((result.readabilityScore ?? 0) * 100)) : Math.round(result.readabilityScore ?? 0)}
                                                    max={100}
                                                />
                                                <span className="text-sm text-base-content/70">
                                                    {((result.readabilityScore ?? 0) <= 1
                                                        ? Math.round(((result.readabilityScore ?? 0) * 100))
                                                        : Math.round(result.readabilityScore ?? 0))}%
                                                </span>
                                            </div>
                                        </div>
                                        {result.summary && (
                                            <div>
                                                <div className="font-medium">Opsummering</div>
                                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                                    <p className="mt-3 text-sm text-base-content/70">
                                                        {result.summary.note}
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                        {result.extractedText && (
                                            <details className="collapse collapse-arrow bg-base-200 rounded-box">
                                                <summary className="collapse-title font-medium">Vis udtrukket tekst</summary>
                                                <div className="collapse-content">
                                                    <pre className="whitespace-pre-wrap text-sm text-base-content/80">{result.extractedText}</pre>
                                                </div>
                                            </details>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1">
                <div className="card-body p-6 md:p-8 gap-10">
                    {sections.map((s, i) => (
                        <React.Fragment key={s.title}>
                            <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                                {i % 2 === 0 ? (
                                    <>
                                        <div className="rounded-box p-6 self-center">
                                            <h2 className="text-2xl font-semibold flex items-center justify-between gap-3">
                                                <span>{s.title}</span>
                                                <s.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                                            </h2>
                                            <p className="text-base-content/70 mt-2">{s.text}</p>
                                            <ul className="list-disc ml-5 mt-2 space-y-1 text-base-content/80">
                                                {s.bullets.map((b) => (
                                                    <li key={`${s.title}-${b}`}>{b}</li>
                                                ))}
                                            </ul>
                                            <div className="pt-4 flex flex-wrap gap-2">
                                                {s.badges.map((badge) => (
                                                    <span key={`${s.title}-${badge}`} className="badge badge-outline">{badge}</span>
                                                ))}
                                            </div>
                                        </div>
                                        <figure className="p-6 flex items-center justify-center md:justify-end self-center">
                                            <img
                                                src={s.image}
                                                alt={s.imageAlt}
                                                className="w-full max-h-72 md:max-h-80 object-contain"
                                                loading="lazy"
                                            />
                                        </figure>
                                    </>
                                ) : (
                                    <>
                                        <figure className="p-6 flex items-center justify-center md:justify-start self-center">
                                            <img
                                                src={s.image}
                                                alt={s.imageAlt}
                                                className="w-full max-h-72 md:max-h-80 object-contain"
                                                loading="lazy"
                                            />
                                        </figure>
                                        <div className="rounded-box p-6 self-center">
                                            <h2 className="text-2xl font-semibold flex items-center justify-between gap-3">
                                                <span>{s.title}</span>
                                                <s.icon className="w-7 h-7 text-primary" aria-hidden="true" />
                                            </h2>
                                            <p className="text-base-content/70 mt-2">{s.text}</p>
                                            <ul className="list-disc ml-5 mt-2 space-y-1 text-base-content/80">
                                                {s.bullets.map((b) => (
                                                    <li key={`${s.title}-${b}`}>{b}</li>
                                                ))}
                                            </ul>
                                            <div className="pt-4 flex flex-wrap gap-2">
                                                {s.badges.map((badge) => (
                                                    <span key={`${s.title}-${badge}`} className="badge badge-outline">{badge}</span>
                                                ))}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </section>
                            {i < sections.length - 1 && <div className="divider" />}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            <div className="divider my-10" />

            <div>
                <h3 className="text-xl font-semibold mb-2 flex items-center justify-between gap-2">
                    <span>Yderligere læsning og kilder</span>
                    <BookOpenIcon className="w-6 h-6 text-primary" aria-hidden="true" />
                </h3>
                <ul className="list-disc ml-6 space-y-1">
                    <li>
                        UK National Careers Service — How to write a CV: {" "}
                        <a href="https://nationalcareers.service.gov.uk/careers-advice/cv-sections" target="_blank" rel="noopener noreferrer">
                            nationalcareers.service.gov.uk
                        </a>
                    </li>
                    <li>
                        Harvard OCS — Resume and Cover Letters: {" "}
                        <a href="https://ocs.fas.harvard.edu/resumes-cvs" target="_blank" rel="noopener noreferrer">
                            ocs.fas.harvard.edu
                        </a>
                    </li>
                    <li>
                        EU — Europass CV guidance: {" "}
                        <a href="https://europa.eu/europass/en/create-europass-cv" target="_blank" rel="noopener noreferrer">
                            europa.eu
                        </a>
                    </li>
                    <li>
                        LinkedIn — Tips to make your resume stand out: {" "}
                        <a href="https://www.linkedin.com/advice/0/how-do-you-make-your-resume-stand-out" target="_blank" rel="noopener noreferrer">
                            linkedin.com
                        </a>
                    </li>
                </ul>
            </div>
        </div>
    );
};

export default GoodCv;
