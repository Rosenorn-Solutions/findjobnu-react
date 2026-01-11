import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { MapPinIcon, BriefcaseIcon, ArrowRightIcon } from "@heroicons/react/24/outline";
import { JobIndexPostsApi } from "../findjobnu-api/";
import type { JobIndexPostResponse } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import JobList from "../components/JobList";
import Seo from "../components/Seo";

const api = createApiClient(JobIndexPostsApi);

// Danish cities with SEO-optimized data
const cityData: Record<string, { name: string; region: string; description: string; popularJobs: string[] }> = {
    "koebenhavn": {
        name: "København",
        region: "Hovedstaden",
        description: "Danmarks hovedstad og største erhvervscentrum med job inden for IT, finans, kreative brancher og meget mere.",
        popularJobs: ["IT", "Marketing", "Finans", "Salg", "Sundhed"]
    },
    "aarhus": {
        name: "Aarhus",
        region: "Midtjylland",
        description: "Danmarks næststørste by med et stærkt startup-miljø og store arbejdsgivere inden for tech, sundhed og uddannelse.",
        popularJobs: ["IT", "Ingeniør", "Sundhed", "Uddannelse", "Retail"]
    },
    "odense": {
        name: "Odense",
        region: "Syddanmark",
        description: "Fyn's hovedstad med voksende tech-sektor, robotklynge og traditionelle industrijob.",
        popularJobs: ["Robotteknologi", "IT", "Produktion", "Sundhed", "Service"]
    },
    "aalborg": {
        name: "Aalborg",
        region: "Nordjylland",
        description: "Nordjyllands største by med stærk ingeniør- og IT-sektor samt store bygge- og anlægsprojekter.",
        popularJobs: ["Ingeniør", "IT", "Byggeri", "Sundhed", "Produktion"]
    },
    "esbjerg": {
        name: "Esbjerg",
        region: "Syddanmark",
        description: "Danmarks femtestørste by med fokus på offshore, energi og havnerelaterede erhverv.",
        popularJobs: ["Offshore", "Energi", "Logistik", "Produktion", "Service"]
    },
    "randers": {
        name: "Randers",
        region: "Midtjylland",
        description: "Østjysk handelsby med industri, logistik og sundhedsjob.",
        popularJobs: ["Produktion", "Logistik", "Sundhed", "Handel", "Service"]
    },
    "kolding": {
        name: "Kolding",
        region: "Syddanmark",
        description: "Trafikalt knudepunkt med design, handel og logistikvirksomheder.",
        popularJobs: ["Design", "Logistik", "Handel", "IT", "Produktion"]
    },
    "horsens": {
        name: "Horsens",
        region: "Midtjylland",
        description: "Voksende by med industri, byggeri og sundhedsjob.",
        popularJobs: ["Byggeri", "Produktion", "Sundhed", "IT", "Service"]
    },
    "vejle": {
        name: "Vejle",
        region: "Syddanmark",
        description: "Erhvervsby med hovedkontorer, IT og konsulentvirksomheder.",
        popularJobs: ["IT", "Konsulent", "Finans", "Salg", "Produktion"]
    },
    "roskilde": {
        name: "Roskilde",
        region: "Sjælland",
        description: "Historisk by tæt på København med offentlige institutioner og sundhedsjob.",
        popularJobs: ["Sundhed", "Offentlig administration", "Uddannelse", "IT", "Service"]
    },
    "herning": {
        name: "Herning",
        region: "Midtjylland",
        description: "Vestjysk erhvervscentrum med mode, møbler og industri.",
        popularJobs: ["Tekstil", "Møbel", "Produktion", "Salg", "Logistik"]
    },
    "silkeborg": {
        name: "Silkeborg",
        region: "Midtjylland",
        description: "Søhøjlandets by med IT, turisme og industrijob.",
        popularJobs: ["IT", "Turisme", "Produktion", "Sundhed", "Service"]
    },
    "naestved": {
        name: "Næstved",
        region: "Sjælland",
        description: "Sydsjællands største by med handel, sundhed og industriarbejdspladser.",
        popularJobs: ["Sundhed", "Handel", "Produktion", "Service", "Offentlig"]
    },
    "fredericia": {
        name: "Fredericia",
        region: "Syddanmark",
        description: "Trafikalt knudepunkt med logistik, industri og energisektor.",
        popularJobs: ["Logistik", "Energi", "Produktion", "Transport", "IT"]
    },
    "viborg": {
        name: "Viborg",
        region: "Midtjylland",
        description: "Historisk by med offentlig administration, sundhed og uddannelse.",
        popularJobs: ["Offentlig", "Sundhed", "Uddannelse", "IT", "Service"]
    },
    "slagelse": {
        name: "Slagelse",
        region: "Sjælland",
        description: "Vestsjællandsk by med handel, sundhed og service.",
        popularJobs: ["Sundhed", "Handel", "Service", "Produktion", "Transport"]
    },
    "holstebro": {
        name: "Holstebro",
        region: "Midtjylland",
        description: "Nordvestjysk kulturby med industri og handel.",
        popularJobs: ["Produktion", "Kultur", "Handel", "Sundhed", "IT"]
    },
    "hilleroed": {
        name: "Hillerød",
        region: "Hovedstaden",
        description: "Nordsjællandsk handelsby tæt på København.",
        popularJobs: ["Sundhed", "Handel", "IT", "Offentlig", "Service"]
    },
    "svendborg": {
        name: "Svendborg",
        region: "Syddanmark",
        description: "Sydfynsk havneby med maritim industri og sundhed.",
        popularJobs: ["Maritim", "Sundhed", "Turisme", "Handel", "Service"]
    },
    "helsingør": {
        name: "Helsingør",
        region: "Hovedstaden",
        description: "Nordsjællandsk grænseby med turisme, kultur og sundhed.",
        popularJobs: ["Turisme", "Kultur", "Sundhed", "Handel", "Service"]
    }
};

// All cities for the index page
const allCities = Object.entries(cityData).map(([slug, data]) => ({
    slug,
    ...data
}));

const JobsByLocation: React.FC = () => {
    const { city } = useParams<{ city?: string }>();
    const [jobs, setJobs] = useState<JobIndexPostResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const pageSize = 10;

    const cityInfo = city ? cityData[city.toLowerCase()] : null;

    useEffect(() => {
        const fetchJobs = async () => {
            if (!cityInfo) {
                setLoading(false);
                return;
            }
            setLoading(true);
            try {
                const data = await api.getJobPostsBySearch({
                    locations: [cityInfo.name],
                    page: currentPage,
                    pageSize
                });
                setJobs(data?.items ?? []);
                setTotalCount(data?.totalCount ?? 0);
            } catch (error) {
                console.error("Failed to fetch jobs", error);
                setJobs([]);
            } finally {
                setLoading(false);
            }
        };

        if (city) {
            fetchJobs();
        } else {
            setLoading(false);
        }
    }, [city, cityInfo, currentPage]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    // Index page showing all cities
    if (!city) {
        return (
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <Seo
                    title="Job efter by – Find job i hele Danmark | FindJob.nu"
                    description="Find job i din by. Se ledige stillinger i København, Aarhus, Odense, Aalborg og alle andre danske byer."
                    path="/job"
                    jsonLd={[
                        {
                            "@context": "https://schema.org",
                            "@type": "CollectionPage",
                            name: "Job efter by i Danmark",
                            description: "Find job i danske byer - København, Aarhus, Odense, Aalborg og mange flere.",
                            url: "https://findjob.nu/job",
                            mainEntity: {
                                "@type": "ItemList",
                                itemListElement: allCities.slice(0, 10).map((c, i) => ({
                                    "@type": "ListItem",
                                    position: i + 1,
                                    name: `Job i ${c.name}`,
                                    url: `https://findjob.nu/job/${c.slug}`
                                }))
                            }
                        },
                        {
                            "@context": "https://schema.org",
                            "@type": "BreadcrumbList",
                            itemListElement: [
                                { "@type": "ListItem", position: 1, name: "Forside", item: "https://findjob.nu/" },
                                { "@type": "ListItem", position: 2, name: "Job efter by", item: "https://findjob.nu/job" }
                            ]
                        }
                    ]}
                />

                <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-box shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 mb-10">
                    <div className="hero-content text-center py-12">
                        <div className="max-w-6xl w-full">
                            <div className="flex items-center justify-center gap-2 mb-4">
                                <MapPinIcon className="w-10 h-10 text-primary" aria-hidden="true" />
                            </div>
                            <h1 className="text-3xl md:text-4xl font-bold">
                                Find job i hele Danmark
                            </h1>
                            <p className="text-base-content/70 mt-3 text-lg">
                                Vælg din by nedenfor for at se ledige stillinger i dit område.
                            </p>
                            <div className="mt-6 flex justify-center gap-2 flex-wrap">
                                <span className="badge badge-primary">20 danske byer</span>
                                <span className="badge badge-secondary badge-outline">Opdateret dagligt</span>
                                <span className="badge badge-accent badge-outline">Gratis at bruge</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {allCities.map((c) => (
                        <Link
                            key={c.slug}
                            to={`/job/${c.slug}`}
                            className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-md border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1"
                        >
                            <div className="card-body p-4">
                                <div className="flex items-center gap-2">
                                    <MapPinIcon className="w-5 h-5 text-primary" aria-hidden="true" />
                                    <h2 className="card-title text-lg">Job i {c.name}</h2>
                                </div>
                                <p className="text-sm text-base-content/70">{c.region}</p>
                                <div className="flex flex-wrap gap-1 mt-2">
                                    {c.popularJobs.slice(0, 3).map((job) => (
                                        <span key={job} className="badge badge-sm badge-outline">{job}</span>
                                    ))}
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-10 card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="card-body">
                        <h2 className="card-title">Kan du ikke finde din by?</h2>
                        <p className="text-base-content/70">
                            Brug vores avancerede jobsøgning til at søge efter job i enhver dansk by eller kommune.
                        </p>
                        <div className="card-actions mt-4">
                            <Link to="/jobsearch" className="btn btn-primary">
                                Gå til jobsøgning
                                <ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // City not found
    if (!cityInfo) {
        return (
            <div className="container max-w-7xl mx-auto px-4 py-8">
                <Seo
                    title="By ikke fundet | FindJob.nu"
                    description="Den valgte by blev ikke fundet. Se job i andre danske byer."
                    path={`/job/${city}`}
                    noIndex
                />
                <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-box shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1">
                    <div className="hero-content text-center py-12">
                        <div className="max-w-lg">
                            <h1 className="text-3xl font-bold">By ikke fundet</h1>
                            <p className="text-base-content/70 mt-2">
                                Vi kunne ikke finde "{city}". Se job i andre byer eller brug vores søgning.
                            </p>
                            <div className="flex gap-3 justify-center mt-6">
                                <Link to="/job" className="btn btn-primary">Se alle byer</Link>
                                <Link to="/jobsearch" className="btn btn-outline">Avanceret søgning</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // City-specific page
    const jobCountLabel = totalCount > 0 ? `${totalCount}+ ledige stillinger` : "Ledige stillinger";
    const seoTitle = `Job i ${cityInfo.name} – ${jobCountLabel} | FindJob.nu`;
    const seoDescription = `Find job i ${cityInfo.name}, ${cityInfo.region}. ${cityInfo.description} Se ${totalCount > 0 ? totalCount : "alle"} ledige stillinger nu.`;

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8">
            <Seo
                title={seoTitle}
                description={seoDescription}
                path={`/job/${city}`}
                jsonLd={[
                    {
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        name: `Job i ${cityInfo.name}`,
                        description: seoDescription,
                        url: `https://findjob.nu/job/${city}`,
                        about: {
                            "@type": "City",
                            name: cityInfo.name,
                            containedInPlace: {
                                "@type": "AdministrativeArea",
                                name: cityInfo.region
                            }
                        }
                    },
                    {
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        itemListElement: [
                            { "@type": "ListItem", position: 1, name: "Forside", item: "https://findjob.nu/" },
                            { "@type": "ListItem", position: 2, name: "Job efter by", item: "https://findjob.nu/job" },
                            { "@type": "ListItem", position: 3, name: `Job i ${cityInfo.name}`, item: `https://findjob.nu/job/${city}` }
                        ]
                    }
                ]}
            />

            <div className="hero bg-gradient-to-br from-primary/10 via-base-100 to-secondary/10 rounded-box shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 mb-8">
                <div className="hero-content text-center py-12">
                    <div className="max-w-6xl w-full">
                        <div className="flex items-center justify-center gap-2 text-sm text-base-content/70 mb-2">
                            <Link to="/job" className="link link-hover">Job efter by</Link>
                            <span>/</span>
                            <span>{cityInfo.region}</span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold flex items-center justify-center gap-2">
                            <MapPinIcon className="w-8 h-8 text-primary" aria-hidden="true" />
                            <span>Job i {cityInfo.name}</span>
                        </h1>
                        <p className="text-base-content/70 mt-2 max-w-2xl mx-auto">
                            {cityInfo.description}
                        </p>
                        <div className="mt-4 flex justify-center gap-2 flex-wrap">
                            {cityInfo.popularJobs.map((job) => (
                                <Link
                                    key={job}
                                    to={`/jobsearch?searchTerm=${encodeURIComponent(job)}&location=${encodeURIComponent(cityInfo.name)}`}
                                    className="badge badge-primary badge-outline hover:badge-primary transition-colors"
                                >
                                    {job}
                                </Link>
                            ))}
                        </div>
                        {totalCount > 0 && (
                            <p className="text-lg font-semibold text-primary mt-4">
                                {totalCount} ledige stillinger i {cityInfo.name}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8">
                <div>
                    <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <BriefcaseIcon className="w-5 h-5 text-primary" aria-hidden="true" />
                        Seneste job i {cityInfo.name}
                    </h2>
                    <JobList
                        jobs={jobs}
                        loading={loading}
                        currentPage={currentPage}
                        pageSize={pageSize}
                        totalCount={totalCount}
                        onPageChange={handlePageChange}
                    />
                </div>

                <aside className="space-y-6">
                    <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-md border border-primary/20 sticky top-24 z-10 transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Søg mere specifikt</h3>
                            <p className="text-sm text-base-content/70">
                                Brug vores avancerede søgning til at filtrere på branche, jobtitel og mere.
                            </p>
                            <Link
                                to={`/jobsearch?location=${encodeURIComponent(cityInfo.name)}`}
                                className="btn btn-primary btn-sm mt-2"
                            >
                                Avanceret søgning
                            </Link>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-md border border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Andre byer</h3>
                            <div className="flex flex-wrap gap-2">
                                {allCities
                                    .filter((c) => c.slug !== city?.toLowerCase())
                                    .slice(0, 8)
                                    .map((c) => (
                                        <Link
                                            key={c.slug}
                                            to={`/job/${c.slug}`}
                                            className="badge badge-outline hover:badge-primary transition-colors"
                                        >
                                            {c.name}
                                        </Link>
                                    ))}
                            </div>
                            <Link to="/job" className="link link-primary text-sm mt-2">
                                Se alle byer →
                            </Link>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-primary/10 to-secondary/10 shadow-md border transition-all hover:shadow-xl hover:-translate-y-1">
                        <div className="card-body">
                            <h3 className="card-title text-lg">Få job direkte i indbakken</h3>
                            <p className="text-sm text-base-content/70">
                                Opret en gratis jobagent og få besked når nye job i {cityInfo.name} bliver opslået.
                            </p>
                            <Link to="/profile?panel=jobAgent" className="btn btn-secondary btn-sm mt-2">
                                Opret jobagent
                            </Link>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default JobsByLocation;
