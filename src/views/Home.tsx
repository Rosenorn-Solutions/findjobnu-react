import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	ArrowRightIcon,
	BookmarkIcon,
	BellAlertIcon,
	ChartBarIcon,
	ChatBubbleLeftRightIcon,
	CheckCircleIcon,
	DocumentTextIcon,
	IdentificationIcon,
	MagnifyingGlassIcon,
	PresentationChartLineIcon,
	SparklesIcon,
	WrenchIcon
} from "@heroicons/react/24/outline";
import Seo from "../components/Seo";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { CategoryJobCountResponse, JobStatisticsResponse } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import { getCategoryIcon } from "../helpers/categoryIcon";

const api = createApiClient(JobIndexPostsApi);

const formatNumber = (value?: number | null) => {
	const numeric = typeof value === "number" && Number.isFinite(value) ? value : null;
	return numeric != null ? new Intl.NumberFormat("da-DK").format(numeric) : "—";
};

const formatCategoryName = (name?: string | null) => {
	const value = (name ?? "").trim();
	return value.length > 16 ? `${value.slice(0, 16)}..` : value;
};

const Home: React.FC = () => {
	const [stats, setStats] = useState<JobStatisticsResponse | null>(null);
	const [statsLoading, setStatsLoading] = useState(false);
	const [statsError, setStatsError] = useState(false);

	useEffect(() => {
		let isActive = true;
		const loadStatistics = async () => {
			setStatsLoading(true);
			setStatsError(false);
			try {
				const data = await api.getJobStatistics();
				if (isActive) setStats(data ?? null);
			} catch {
				if (isActive) setStatsError(true);
			} finally {
				if (isActive) setStatsLoading(false);
			}
		};
		loadStatistics();
		return () => {
			isActive = false;
		};
	}, []);

	const featureCards: Array<{
		title: string;
		description: string;
		to?: string;
		tag?: string;
		icon: React.ReactNode;
		features: string[];
		highlight?: boolean;
	}> = [
		{
			title: "Jobsøgning",
			description: "Søg blandt alle danske jobopslag, filtrér på kategori og geografi, og gem dine fund.",
			to: "/jobsearch",
			tag: "Ny visning",
			icon: <MagnifyingGlassIcon className="w-8 h-8" aria-hidden="true" />,
			highlight: true,
			features: [
				"Søg blandt alle danske job",
				"Filtrér efter kategori og placering",
				"Gem interessante opslag",
				"Opdateret dagligt"
			]
		},
		{
			title: "Anbefalede jobs",
			description: "Få personlige jobanbefalinger baseret på din profil, kompetencer og erfaring. Jo mere du udfylder, desto bedre bliver matchene.",
			to: "/jobsearch?panel=recommended",
			tag: "Personligt",
			icon: <SparklesIcon className="w-8 h-8" aria-hidden="true" />,
			highlight: true,
			features: [
				"Matcher på dine kompetencer",
				"Baseret på din profil",
				"Opdateres automatisk",
				"Helt gratis at bruge"
			]
		},
		{
			title: "Værktøjer",
			description: "Få en samlet indgang til guides, værktøjer og inspiration til din næste ansøgning.",
			to: "/vaerktoejer",
			icon: <WrenchIcon className="w-8 h-8" aria-hidden="true" />,
			features: [
				"CV-analyse og tjek",
				"Jobsøgningsguides",
				"Ansøgningstips",
				"Helt gratis værktøjer"
			]
		},
		{
			title: "Det gode CV",
			description: "Læs hvordan du bygger et CV, der bliver set. Følg konkrete eksempler og tjeklister.",
			to: "/cv",
			icon: <DocumentTextIcon className="w-8 h-8" aria-hidden="true" />,
			features: [
				"Guides og eksempler",
				"ATS-optimering",
				"Tjeklister",
				"Gratis CV-analyse"
			]
		},
		{
			title: "Profil og kompetencer",
			description: "Opdatér din profil, tilføj erfaring og færdigheder, og lad os matche dig bedre.",
			to: "/profile",
			icon: <IdentificationIcon className="w-8 h-8" aria-hidden="true" />,
			features: [
				"LinkedIn import",
				"Kompetencemapping",
				"Bedre jobanbefalinger",
				"Synkronisering"
			]
		},
		{
			title: "Jobagenter",
			description: "Opsæt og justér dine jobagenter, så nye opslag lander direkte i din indbakke.",
			to: "/profile/job-agent",
			icon: <BellAlertIcon className="w-8 h-8" aria-hidden="true" />,
			features: [
				"Automatiske notifikationer",
				"Tilpasbare kriterier",
				"Daglig eller ugentlig",
				"Afmeld når du vil"
			]
		},
		{
			title: "Gemte job",
			description: "Se og administrér de opslag, du har gemt til senere opfølgning.",
			to: "/profile/saved-jobs",
			icon: <BookmarkIcon className="w-8 h-8" aria-hidden="true" />,
			features: [
				"Ubegrænset lagring",
				"Organisér efter status",
				"Deadlines og noter",
				"Synkroniseret på tværs"
			]
		},
		{
			title: "Support og spørgsmål",
			description: "Har du feedback eller brug for hjælp? Kontakt os direkte for at få svar.",
			to: "/contact",
			icon: <ChatBubbleLeftRightIcon className="w-8 h-8" aria-hidden="true" />,
			features: [
				"Hurtig respons",
				"Dansk support",
				"Feedback velkommen",
				"Teknisk hjælp"
			]
		},
		{
			title: "Jobindsigt",
			description: "Se et øjebliksbillede af det danske jobmarked med aktive opslag og nye trends.",
			tag: "Statistik",
			icon: <PresentationChartLineIcon className="w-8 h-8" aria-hidden="true" />,
			features: [
				"Aktive jobopslag",
				"Nye jobs ugentligt",
				"Mest udbudte kategorier",
				"Markedstendenser"
			]
		}
	];

	const topCategories = (stats?.topCategories ?? []).slice(0, 6).filter((c): c is CategoryJobCountResponse => Boolean(c?.name));

	return (
		<div className="max-w-7xl w-full mx-auto px-4 pb-12 prose prose-neutral">
			<Seo
				title="FindJob.nu – Gratis jobsøgning, CV-tjek og jobanbefalinger i Danmark"
				description="Find dit næste job med gratis CV-analyse, personlige jobanbefalinger og jobagenter. Søg blandt tusindvis af danske stillinger."
				path="/"
				jsonLd={[
					{
						"@context": "https://schema.org",
						"@type": "WebSite",
						name: "FindJob.nu",
						url: "https://findjob.nu/",
						description: "Gratis jobsøgning, CV-analyse og jobanbefalinger i Danmark",
						potentialAction: {
							"@type": "SearchAction",
							target: {
								"@type": "EntryPoint",
								urlTemplate: "https://findjob.nu/jobsearch?searchTerm={search_term_string}"
							},
							"query-input": "required name=search_term_string"
						}
					},
					{
						"@context": "https://schema.org",
						"@type": "Organization",
						name: "FindJob.nu",
						url: "https://findjob.nu",
						logo: "https://findjob.nu/logo.png",
						sameAs: [],
						contactPoint: {
							"@type": "ContactPoint",
							contactType: "customer service",
							url: "https://findjob.nu/contact"
						}
					},
					{
						"@context": "https://schema.org",
						"@type": "SoftwareApplication",
						name: "FindJob.nu",
						applicationCategory: "BusinessApplication",
						operatingSystem: "Web",
						offers: {
							"@type": "Offer",
							price: "0",
							priceCurrency: "DKK"
						},
						description: "Gratis jobsøgning med CV-analyse, personlige jobanbefalinger og jobagenter"
					}
				]}
			/>

			<section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr] items-stretch">
				<div className="card bg-linear-to-br from-primary/15 via-base-100 to-secondary/10 shadow-lg border border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
					<div className="card-body p-8 flex flex-col gap-6">
						<div className="space-y-3">
							<p className="text-sm uppercase tracking-[0.2em] text-primary/80 font-semibold">Velkommen til FindJob.nu</p>
							<h1 className="text-3xl md:text-4xl font-bold leading-tight text-base-content">En samlet forside til jobsøgning, læring og overblik</h1>
							<p className="text-lg text-base-content/80 max-w-2xl leading-relaxed">Find relevante job, opbyg dit CV og følg udviklingen på jobmarkedet. Vi har samlet de vigtigste funktioner ét sted, så du kan vælge det, der passer dig.</p>
						</div>
						<div className="flex flex-wrap gap-3">
							<Link to="/jobsearch" className="btn btn-primary btn-lg">Start jobsøgningen</Link>
							<Link to="/vaerktoejer" className="btn btn-outline btn-secondary btn-lg">Se værktøjer til jobsøgende</Link>
						</div>
						<div className="grid gap-3 md:grid-cols-3">
							<Link to="/cv" className="bg-base-100/80 rounded-box p-4 shadow-sm border border-base-200 hover:no-underline focus-visible:outline-none">
								<div className="flex items-center gap-2 text-sm text-base-content/70">
									<DocumentTextIcon className="w-5 h-5 text-primary" aria-hidden="true" />
									<span>Det gode CV</span>
								</div>
								<p className="text-xl font-semibold leading-relaxed">Guides, eksempler og checklister</p>
							</Link>
							<Link to="/profile" className="bg-base-100/80 rounded-box p-4 shadow-sm border border-base-200 hover:no-underline focus-visible:outline-none">
								<div className="flex items-center gap-2 text-sm text-base-content/70">
									<IdentificationIcon className="w-5 h-5 text-secondary" aria-hidden="true" />
									<span>Profil og anbefalinger</span>
								</div>
								<p className="text-xl font-semibold leading-relaxed">Tilpas din profil og få bedre match</p>
							</Link>
							<Link to="/profile/saved-jobs" className="bg-base-100/80 rounded-box p-4 shadow-sm border border-base-200 hover:no-underline focus-visible:outline-none">
								<div className="flex items-center gap-2 text-sm text-base-content/70">
									<BookmarkIcon className="w-5 h-5 text-accent" aria-hidden="true" />
									<span>Gemte job</span>
								</div>
								<p className="text-xl font-semibold leading-relaxed">Følg dine fund og jobagenter</p>
							</Link>
						</div>
					</div>
				</div>

			<div className="card bg-linear-to-br from-primary/5 to-secondary/5 shadow-lg border border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
					<div className="card-body p-6 flex flex-col gap-4">
						<div className="flex items-start justify-between gap-4">
							<div>
								<p className="text-sm uppercase tracking-[0.2em] text-base-content/70 font-semibold">Jobindsigt</p>
								<h2 className="text-2xl font-bold">Aktuelle nøgletal fra jobmarkedet</h2>
								<p className="text-base text-base-content/70 leading-relaxed">Data opdateres fra JobIndex og viser et hurtigt overblik over nye og aktive opslag.</p>
							</div>
							{statsLoading && <span className="loading loading-spinner loading-md text-primary" aria-label="Henter statistik" />}
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
							{[
								{ label: "Aktive jobopslag", value: formatNumber(stats?.totalJobs), icon: <ChartBarIcon className="w-5 h-5 text-primary" aria-hidden="true" /> },
								{ label: "Nye job i sidste uge", value: formatNumber(stats?.newJobsLastWeek), icon: <PresentationChartLineIcon className="w-5 h-5 text-secondary" aria-hidden="true" /> },
								{ label: "Nye job i sidste måned", value: formatNumber(stats?.newJobsLastMonth), icon: <ChartBarIcon className="w-5 h-5 text-accent" aria-hidden="true" /> }
							].map((item) => (
						<div key={item.label} className="rounded-box border border-base-200 bg-base-100 p-4 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
									<div className="flex items-center gap-2 text-sm text-base-content/60">
										{item.icon}
										<span>{item.label}</span>
									</div>
									<p className="text-3xl font-bold text-base-content mt-2 leading-relaxed">{item.value}</p>
								</div>
							))}
						</div>

						<div>
							<p className="text-sm font-semibold text-base-content/80">Mest udbudte kategorier</p>
							<div className="mt-3 grid auto-rows-fr gap-3 sm:grid-cols-2">
								{topCategories.length === 0 && !statsLoading && (
									<span className="text-sm text-base-content/60">Ingen data tilgængelig endnu.</span>
								)}
								{topCategories.map((category) => {
									const icon = getCategoryIcon(category.name);
									const card = (
										<div className="flex h-full items-center justify-between gap-3 rounded-box border border-base-200 bg-base-100 px-4 py-3 shadow-sm hover:shadow-md transition-shadow">
											<div className="flex items-center gap-3">
												<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
													{icon}
												</div>
												<div className="flex flex-col">
													<span className="text-base font-semibold text-base-content" title={category.name ?? undefined}>{formatCategoryName(category.name)}</span>
													<span className="text-base-content/70" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>{formatNumber(category.numberOfJobs)} opslag</span>
												</div>
											</div>
											<span className="text-primary font-semibold" style={{ fontSize: '0.875rem', lineHeight: 1.5 }}>Se job →</span>
										</div>
									);
									return category.id != null ? (
										<Link
											key={category.id}
											to={`/jobsearch?category=${category.id}`}
											className="block h-full hover:no-underline focus-visible:outline-none"
										>
											{card}
										</Link>
									) : (
										<div key={category.name} className="h-full">{card}</div>
									);
								})}
							</div>
						</div>

						{statsError && (
							<div className="alert alert-warning">
								<span>Kunne ikke hente statistik lige nu. Prøv igen senere.</span>
							</div>
						)}
					</div>
				</div>
			</section>

			<section className="mt-10">
				<div className="flex items-center justify-between flex-wrap gap-3 mb-4">
					<div>
						<p className="text-sm uppercase tracking-[0.2em] text-base-content/70 font-semibold">Overblik</p>
						<h2 className="text-2xl font-bold">Vælg den del af FindJob.nu, du vil bruge</h2>
						<p className="text-sm text-base-content/70">Hop direkte til den funktion, der hjælper dig nu – fra jobsøgning og CV til jobagenter.</p>
					</div>
				</div>
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{featureCards.map((card) => {
						const content = (
							<div className="card-body">
								<div className="flex items-start justify-between">
									<div className={`p-3 rounded-lg ${card.highlight ? "bg-primary/10 text-primary" : "bg-base-200 text-base-content/80"}`}>
										{card.icon}
									</div>
									{card.tag && (
										<span className={`badge ${card.highlight ? "badge-primary" : "badge-outline"}`}>
											{card.tag}
										</span>
									)}
								</div>
								<h3 className="card-title mt-4">{card.title}</h3>
								<p className="text-base-content/70 leading-relaxed">{card.description}</p>
								<ul className="mt-4 space-y-2">
									{card.features.map((feature) => (
										<li key={feature} className="flex items-center gap-2 text-sm text-base-content/80">
											<CheckCircleIcon className="w-4 h-4 text-success shrink-0" aria-hidden="true" />
											{feature}
										</li>
									))}
								</ul>
								{card.to && (
									<div className="card-actions mt-4">
										<span className="link link-primary font-medium flex items-center gap-1">
											Gå til {card.title.toLowerCase()}
											<ArrowRightIcon className="w-4 h-4" aria-hidden="true" />
										</span>
									</div>
								)}
							</div>
						);

						return card.to ? (
							<Link
								key={card.title}
								to={card.to}
							className="card bg-linear-to-br from-primary/5 to-secondary/5 shadow-lg border border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1"
						>
							{content}
						</Link>
					) : (
						<div key={card.title} className="card bg-linear-to-br from-primary/5 to-secondary/5 shadow-lg border border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
						{content}
					</div>
				);
			})}
		</div>
	</section>

	<section className="mt-12 grid gap-6 lg:grid-cols-3">
				<div className="card bg-linear-to-br from-primary/5 to-secondary/5 border border-primary/20 shadow-sm lg:col-span-2 transition-all hover:shadow-xl hover:-translate-y-1">
					<div className="card-body gap-4">
						<h3 className="text-xl font-bold">Sådan kommer du i gang</h3>
						<ul className="list-disc list-inside space-y-2 text-base-content/80 leading-relaxed">
							<li>Start i jobsøgningen for at få et hurtigt overblik over aktuelle opslag.</li>
							<li>Opdatér din profil med erfaring og færdigheder for at få mere relevante anbefalinger.</li>
							<li>Læs vores guide til det gode CV, og brug den som tjekliste, inden du sender ansøgninger.</li>
							<li>Opret jobagenter og gem interessante opslag, så du kan følge op senere.</li>
						</ul>
					</div>
				</div>
				<div className="card bg-secondary text-secondary-content shadow-sm">
					<div className="card-body gap-4">
						<h3 className="text-xl font-bold">Tip: Brug data i din søgning</h3>
						<p className="text-secondary-content/90 leading-relaxed">Kig på de mest udbudte kategorier og de nye tendenser fra den seneste uge, før du målretter dit næste søgeord.</p>
						<Link to="/jobsearch" className="btn btn-outline border-secondary-content text-secondary-content">Se job og filtrér nu</Link>
					</div>
				</div>
			</section>
		</div>
	);
};

export default Home;