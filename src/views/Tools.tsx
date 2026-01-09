import React from "react";
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
        badge: "Gratis"
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
        href: "/profile?panel=jobAgent"
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
        href: "/myjobs"
    }
];

const Tools: React.FC = () => {
    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
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

            <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-box shadow-xl mb-10">
                <div className="hero-content text-center py-12">
                    <div className="max-w-3xl">
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
                    </div>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {tools.map((tool) => (
                    <Link
                        key={tool.slug}
                        to={tool.href}
                        className={`card shadow-lg border transition-all hover:shadow-xl hover:-translate-y-1 ${
                            tool.highlight ? "bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20" : "bg-base-100"
                        }`}
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

            <div className="mt-12 card bg-base-100 shadow-xl border">
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
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box">
                        <input type="radio" name="faq-accordion" aria-label="Er værktøjerne virkelig gratis?" defaultChecked />
                        <div className="collapse-title font-medium">
                            Er værktøjerne virkelig gratis?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>Ja, alle værktøjer er 100% gratis. Der er ingen betalingsmur, ingen premium-version, og ingen skjulte omkostninger.</p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box">
                        <input type="radio" name="faq-accordion" aria-label="Hvad sker der med mit CV når jeg uploader det?" />
                        <div className="collapse-title font-medium">
                            Hvad sker der med mit CV når jeg uploader det?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>Dit CV analyseres i realtid og slettes automatisk bagefter. Vi gemmer hverken dokumentet eller dine personlige oplysninger.</p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box">
                        <input type="radio" name="faq-accordion" aria-label="Hvordan virker jobanbefalingerne?" />
                        <div className="collapse-title font-medium">
                            Hvordan virker jobanbefalingerne?
                        </div>
                        <div className="collapse-content text-base-content/70">
                            <p>Vi matcher dine færdigheder og erfaringer med jobopslag. Jo mere du udfylder din profil, desto bedre bliver anbefalingerne.</p>
                        </div>
                    </div>
                    <div className="collapse collapse-arrow bg-base-100 border rounded-box">
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
