import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
	ArrowRightIcon,
	BellAlertIcon,
	BookmarkIcon,
	ChartBarIcon,
	ChatBubbleLeftRightIcon,
	CheckCircleIcon,
	DocumentTextIcon,
	IdentificationIcon,
	MagnifyingGlassIcon,
	PresentationChartLineIcon,
	SparklesIcon,
	WrenchIcon,
} from "@heroicons/react/24/outline";
import Seo from "../components/Seo";
import { JobIndexPostsApi } from "../findjobnu-api";
import type { CategoryJobCountResponse, JobStatisticsResponse } from "../findjobnu-api/models";
import { createApiClient } from "../helpers/ApiFactory";
import { getCategoryIcon } from "../helpers/categoryIcon";

const api = createApiClient(JobIndexPostsApi);
const numberFormatter = new Intl.NumberFormat("da-DK");

type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;

type ShortcutCardData = {
	title: string;
	description: string;
	to: string;
	icon: IconComponent;
	accentClass: string;
};

type FeatureCardData = {
	title: string;
	eyebrow: string;
	description: string;
	to?: string;
	tag?: string;
	icon: IconComponent;
	features: string[];
	highlight?: boolean;
	accentClass: string;
};

type GettingStartedStep = {
	title: string;
	description: string;
};

const quickAccessCards: ShortcutCardData[] = [
	{
		title: "Det gode CV",
		description: "Guides, eksempler og checklister, når du vil styrke dit næste CV.",
		to: "/cv",
		icon: DocumentTextIcon,
		accentClass: "bg-primary/10 text-primary",
	},
	{
		title: "Profil og anbefalinger",
		description: "Opdatér profilen og gør dine jobmatch mere relevante over tid.",
		to: "/profile",
		icon: IdentificationIcon,
		accentClass: "bg-secondary/12 text-secondary",
	},
	{
		title: "Gemte job",
		description: "Saml de opslag, du vil vende tilbage til, og følg op i dit eget tempo.",
		to: "/profile/saved-jobs",
		icon: BookmarkIcon,
		accentClass: "bg-accent/12 text-accent",
	},
];

const homePillars = [
	"Gratis jobsøgning, værktøjer og jobindsigt samlet ét sted.",
	"Profil, anbefalinger og jobagenter hænger tættere sammen.",
	"Fokus på hurtige valg, tydelig navigation og bedre mobilflow.",
];

const featureCards: FeatureCardData[] = [
	{
		title: "Jobsøgning",
		eyebrow: "Søgning",
		description: "Søg blandt alle danske jobopslag, filtrér på kategori og geografi, og gem dine fund.",
		to: "/jobsearch",
		tag: "Ny visning",
		icon: MagnifyingGlassIcon,
		highlight: true,
		accentClass: "bg-primary/10 text-primary",
		features: [
			"Søg blandt alle danske job",
			"Filtrér efter kategori og placering",
			"Gem interessante opslag",
			"Opdateret dagligt",
		],
	},
	{
		title: "Anbefalede jobs",
		eyebrow: "Personligt",
		description: "Få personlige jobanbefalinger baseret på din profil, kompetencer og erfaring. Jo mere du udfylder, desto bedre bliver matchene.",
		to: "/jobsearch?panel=recommended",
		tag: "Personligt",
		icon: SparklesIcon,
		highlight: true,
		accentClass: "bg-secondary/12 text-secondary",
		features: [
			"Matcher på dine kompetencer",
			"Baseret på din profil",
			"Opdateres automatisk",
			"Helt gratis at bruge",
		],
	},
	{
		title: "Værktøjer",
		eyebrow: "Guides",
		description: "Få en samlet indgang til guides, værktøjer og inspiration til din næste ansøgning.",
		to: "/vaerktoejer",
		icon: WrenchIcon,
		accentClass: "bg-primary/10 text-primary",
		features: [
			"CV-analyse og tjek",
			"Jobsøgningsguides",
			"Ansøgningstips",
			"Helt gratis værktøjer",
		],
	},
	{
		title: "Det gode CV",
		eyebrow: "CV",
		description: "Læs hvordan du bygger et CV, der bliver set. Følg konkrete eksempler og tjeklister.",
		to: "/cv",
		icon: DocumentTextIcon,
		accentClass: "bg-secondary/12 text-secondary",
		features: [
			"Guides og eksempler",
			"ATS-optimering",
			"Tjeklister",
			"Gratis CV-analyse",
		],
	},
	{
		title: "Profil og kompetencer",
		eyebrow: "Profil",
		description: "Opdatér din profil, tilføj erfaring og færdigheder, og lad os matche dig bedre.",
		to: "/profile",
		icon: IdentificationIcon,
		accentClass: "bg-accent/12 text-accent",
		features: [
			"LinkedIn import",
			"Kompetencemapping",
			"Bedre jobanbefalinger",
			"Synkronisering",
		],
	},
	{
		title: "Jobagenter",
		eyebrow: "Notifikationer",
		description: "Opsæt og justér dine jobagenter, så nye opslag lander direkte i din indbakke.",
		to: "/profile/job-agent",
		icon: BellAlertIcon,
		accentClass: "bg-primary/10 text-primary",
		features: [
			"Automatiske notifikationer",
			"Tilpasbare kriterier",
			"Daglig eller ugentlig",
			"Afmeld når du vil",
		],
	},
	{
		title: "Gemte job",
		eyebrow: "Shortlist",
		description: "Se og administrér de opslag, du har gemt til senere opfølgning.",
		to: "/profile/saved-jobs",
		icon: BookmarkIcon,
		accentClass: "bg-secondary/12 text-secondary",
		features: [
			"Ubegrænset lagring",
			"Organisér efter status",
			"Deadlines og noter",
			"Synkroniseret på tværs",
		],
	},
	{
		title: "Support og spørgsmål",
		eyebrow: "Kontakt",
		description: "Har du feedback eller brug for hjælp? Kontakt os direkte for at få svar.",
		to: "/contact",
		icon: ChatBubbleLeftRightIcon,
		accentClass: "bg-accent/12 text-accent",
		features: [
			"Hurtig respons",
			"Dansk support",
			"Feedback velkommen",
			"Teknisk hjælp",
		],
	},
	{
		title: "Jobindsigt",
		eyebrow: "Statistik",
		description: "Se et øjebliksbillede af det danske jobmarked med aktive opslag og nye trends.",
		tag: "Statistik",
		icon: PresentationChartLineIcon,
		accentClass: "bg-primary/10 text-primary",
		features: [
			"Aktive jobopslag",
			"Nye jobs ugentligt",
			"Mest udbudte kategorier",
			"Markedstendenser",
		],
	},
];

const gettingStartedSteps: GettingStartedStep[] = [
	{
		title: "Start i jobsøgningen",
		description: "Få et hurtigt overblik over aktuelle opslag og begynd med brede søgninger, før du indsnævrer filtrene.",
	},
	{
		title: "Opdatér din profil",
		description: "Tilføj erfaring og færdigheder, så anbefalinger og jobagent bliver mere præcise.",
	},
	{
		title: "Brug CV-guiden som tjekliste",
		description: "Læs vores råd om det gode CV, og gør materialet skarpere, før du sender ansøgninger.",
	},
	{
		title: "Gem og følg op",
		description: "Opret jobagenter og gem relevante opslag, så du kan vende tilbage til dem i dit eget tempo.",
	},
];

const formatNumber = (value?: number | null) => {
	const numeric = typeof value === "number" && Number.isFinite(value) ? value : null;
	if (numeric == null) {
		return "—";
	}

	return numberFormatter.format(numeric);
};

const formatCategoryName = (name?: string | null) => {
	const value = (name ?? "").trim();
	return value.length > 16 ? `${value.slice(0, 16)}..` : value;
};

const ShortcutCard: React.FC<ShortcutCardData> = ({ title, description, to, icon: Icon, accentClass }) => (
	<Link
		to={to}
		className="group rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:no-underline focus-visible:outline-none"
	>
		<div className="flex items-start gap-3">
			<div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${accentClass}`}>
				<Icon className="h-5 w-5" aria-hidden="true" />
			</div>
			<div className="space-y-1">
				<p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">Hurtig adgang</p>
				<p className="text-lg font-semibold text-base-content">{title}</p>
			</div>
		</div>
		<p className="mt-3 text-sm leading-6 text-base-content/68">{description}</p>
	</Link>
);

const FeatureCard: React.FC<{ card: FeatureCardData }> = ({ card }) => {
	const Icon = card.icon;
	const content = (
		<>
			<div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_58%)]" />
			<div className="relative flex h-full flex-col gap-5 p-5 sm:p-6">
				<div className="flex items-start justify-between gap-3">
					<div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${card.accentClass}`}>
						<Icon className="h-7 w-7" aria-hidden="true" />
					</div>
					{card.tag ? (
						<span className="rounded-full border border-base-300/70 bg-base-100/82 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-base-content/50 shadow-sm">
							{card.tag}
						</span>
					) : null}
				</div>

				<div className="space-y-2">
					<p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-base-content/45">{card.eyebrow}</p>
					<h3 className="text-2xl font-semibold tracking-tight text-base-content">{card.title}</h3>
					<p className="text-base leading-7 text-base-content/68">{card.description}</p>
				</div>

				<div className="space-y-3">
					{card.features.map((feature) => (
						<div key={feature} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
							<CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
							<span>{feature}</span>
						</div>
					))}
				</div>

				{card.to ? (
					<div className="mt-auto flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.16em] text-primary">
						<span>Gå til {card.title.toLowerCase()}</span>
						<ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
					</div>
				) : null}
			</div>
		</>
	);

	const className = [
		"group relative overflow-hidden rounded-[1.75rem] border shadow-[0_22px_60px_-42px_rgba(15,23,42,0.54)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_32px_80px_-42px_rgba(15,23,42,0.62)]",
		card.highlight
			? "border-primary/20 bg-gradient-to-br from-primary/12 via-base-100 to-secondary/10"
			: "border-base-300/70 bg-gradient-to-br from-base-100/95 via-base-100/88 to-primary/5",
	].join(" ");

	if (!card.to) {
		return <article className={className}>{content}</article>;
	}

	return (
		<Link to={card.to} className={`${className} hover:no-underline focus-visible:outline-none`}>
			{content}
		</Link>
	);
};

const CategoryLinkCard: React.FC<{ category: CategoryJobCountResponse }> = ({ category }) => {
	const icon = getCategoryIcon(category.categoryName);
	const content = (
		<div className="flex h-full items-center justify-between gap-2.5 rounded-[1.05rem] border border-base-300/70 bg-base-100/82 px-3.5 py-2.5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
			<div className="flex min-w-0 items-center gap-2.5">
				<div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
					{icon}
				</div>
				<div className="min-w-0 flex-1">
					<span className="block truncate text-sm font-semibold leading-5 text-base-content" title={category.categoryName ?? undefined}>{formatCategoryName(category.categoryName)}</span>
					<span className="text-xs leading-5 text-base-content/65">{formatNumber(category.numberOfJobs)} opslag</span>
				</div>
			</div>
			<span className="shrink-0 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-primary">Se job</span>
		</div>
	);

	if (category.id == null) {
		return <div className="h-full">{content}</div>;
	}

	return (
		<Link
			to={`/jobsearch?category=${category.categoryKey ?? category.id}`}
			className="block h-full hover:no-underline focus-visible:outline-none"
		>
			{content}
		</Link>
	);
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
				if (isActive) {
					setStats(data ?? null);
				}
			} catch {
				if (isActive) {
					setStatsError(true);
				}
			} finally {
				if (isActive) {
					setStatsLoading(false);
				}
			}
		};

		loadStatistics();
		return () => {
			isActive = false;
		};
	}, []);

	const featuredFeatureCards = featureCards.filter((card) => card.highlight);
	const standardFeatureCards = featureCards.filter((card) => !card.highlight);
	const topCategories = (stats?.topCategories ?? []).slice(0, 4).filter((category): category is CategoryJobCountResponse => Boolean(category?.categoryName));
	const marketStats = [
		{
			label: "Aktive jobopslag",
			value: formatNumber(stats?.totalJobs),
			icon: ChartBarIcon,
			note: "tilgængelige nu",
		},
		{
			label: "Nye job i sidste uge",
			value: formatNumber(stats?.newJobsLastWeek),
			icon: PresentationChartLineIcon,
			note: "frisk efterspørgsel",
		},
		{
			label: "Nye job i sidste måned",
			value: formatNumber(stats?.newJobsLastMonth),
			icon: ChartBarIcon,
			note: "løbende aktivitet",
		},
	];

	return (
		<div className="container max-w-7xl mx-auto px-4 py-8">
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
								urlTemplate: "https://findjob.nu/jobsearch?searchTerm={search_term_string}",
							},
							"query-input": "required name=search_term_string",
						},
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
							url: "https://findjob.nu/contact",
						},
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
							priceCurrency: "DKK",
						},
						description: "Gratis jobsøgning med CV-analyse, personlige jobanbefalinger og jobagenter",
					},
				]}
			/>

			<div className="not-prose space-y-10">
				<section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
					<div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_52%)]" />
					<div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
					<div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

					<div className="relative grid gap-6 p-5 sm:p-7 xl:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.92fr)] xl:p-8">
						<div className="space-y-6">
							<div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
								<SparklesIcon className="h-4 w-4" aria-hidden="true" />
								Velkommen til FindJob.nu
							</div>

							<div className="space-y-3">
								<h1 className="max-w-4xl text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-[3rem]">
									En samlet forside til jobsøgning, læring og overblik
								</h1>
								<p className="max-w-3xl text-base leading-7 text-base-content/72 sm:text-lg">
									Find relevante job, opbyg dit CV og følg udviklingen på jobmarkedet. Vi har samlet de vigtigste funktioner ét sted, så du kan vælge det, der passer dig.
								</p>
							</div>

							<div className="flex flex-col gap-3 sm:flex-row">
								<Link to="/jobsearch" className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20">
									Start jobsøgningen
									<ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
								</Link>
								<Link to="/vaerktoejer" className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/80 bg-base-100/75 px-6 shadow-sm">
									Se værktøjer til jobsøgende
								</Link>
							</div>

							<div className="grid gap-4 md:grid-cols-3">
								{quickAccessCards.map((card) => (
									<ShortcutCard key={card.title} {...card} />
								))}
							</div>

							<div className="space-y-3">
								{homePillars.map((item) => (
									<div key={item} className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
										<CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
										<span>{item}</span>
									</div>
								))}
							</div>
						</div>

						<div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-xl sm:p-6">
							<div className="flex items-start justify-between gap-4">
								<div className="space-y-2">
									<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Jobindsigt</p>
									<h2 className="text-2xl font-semibold tracking-tight text-base-content">Aktuelle nøgletal fra jobmarkedet</h2>
									<p className="text-sm leading-6 text-base-content/68">Data opdateres fra JobIndex og viser et hurtigt overblik over nye og aktive opslag.</p>
								</div>
								{statsLoading ? <span className="loading loading-spinner loading-md text-primary" aria-label="Henter statistik" /> : null}
							</div>

							<div className="mt-5 grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
								{marketStats.map((item) => {
									const Icon = item.icon;
									return (
										<div key={item.label} className="rounded-[1.25rem] border border-base-300/70 bg-base-100/82 p-4 shadow-sm">
											<div className="flex items-center gap-2 text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-base-content/45">
												<Icon className="h-4 w-4 text-primary" aria-hidden="true" />
												<span>{item.label}</span>
											</div>
											<p className="mt-3 text-3xl font-semibold text-base-content">{item.value}</p>
											<p className="text-sm leading-6 text-base-content/65">{item.note}</p>
										</div>
									);
								})}
							</div>

							<div className="mt-5">
								<p className="text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">Mest udbudte kategorier</p>
								<div className="mt-3 grid auto-rows-fr gap-3 sm:grid-cols-2">
									{topCategories.length === 0 && !statsLoading ? (
										<span className="text-sm text-base-content/60">Ingen data tilgængelig endnu.</span>
									) : null}
									{topCategories.map((category) => (
										<CategoryLinkCard key={`${category.id ?? category.categoryKey}-${category.categoryName}`} category={category} />
									))}
								</div>
							</div>

							{statsError ? (
								<div className="alert alert-warning mt-5 rounded-[1.2rem] shadow-sm">
									<span>Kunne ikke hente statistik lige nu. Prøv igen senere.</span>
								</div>
							) : null}
						</div>
					</div>
				</section>

				<section className="space-y-5">
					<div className="space-y-2">
						<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Overblik</p>
						<h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Vælg den del af FindJob.nu, du vil bruge</h2>
						<p className="max-w-2xl text-base leading-7 text-base-content/68">Hop direkte til den funktion, der hjælper dig nu - fra jobsøgning og CV til jobagenter.</p>
					</div>

					<div className="grid gap-5 lg:grid-cols-2">
						{featuredFeatureCards.map((card) => (
							<FeatureCard key={card.title} card={card} />
						))}
					</div>

					<div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
						{standardFeatureCards.map((card) => (
							<FeatureCard key={card.title} card={card} />
						))}
					</div>
				</section>

				<section className="grid gap-6 xl:grid-cols-[minmax(0,1.08fr)_minmax(280px,0.92fr)] xl:items-start">
					<div className="rounded-[1.9rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 p-5 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.5)] sm:p-6 lg:p-8">
						<div className="space-y-2">
							<p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Kom i gang</p>
							<h3 className="text-2xl font-semibold tracking-tight text-base-content">Sådan kommer du i gang</h3>
							<p className="max-w-2xl text-base leading-7 text-base-content/68">
								Du behøver ikke bruge alt på én gang. Start med det, der hjælper dig nu, og byg videre, når du er klar.
							</p>
						</div>

						<div className="mt-6 grid gap-4 md:grid-cols-2">
							{gettingStartedSteps.map((step, index) => (
								<div key={step.title} className="rounded-[1.45rem] border border-base-300/70 bg-base-100/82 p-5 shadow-sm">
									<div className="flex items-start gap-4">
										<div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-lg font-semibold text-primary">
											{index + 1}
										</div>
										<div className="space-y-2">
											<h4 className="text-lg font-semibold text-base-content">{step.title}</h4>
											<p className="text-sm leading-6 text-base-content/68 sm:text-base">{step.description}</p>
										</div>
									</div>
								</div>
							))}
						</div>
					</div>

					<div className="rounded-[1.9rem] border border-base-300/70 bg-gradient-to-br from-secondary to-primary text-secondary-content shadow-[0_24px_80px_-42px_rgba(15,23,42,0.48)]">
						<div className="space-y-5 p-5 sm:p-6 lg:p-8">
							<div className="space-y-2">
								<p className="text-xs font-semibold uppercase tracking-[0.22em] text-secondary-content/75">Markedssignal</p>
								<h3 className="text-2xl font-semibold tracking-tight">Tip: Brug data i din søgning</h3>
								<p className="text-base leading-7 text-secondary-content/88">
									Kig på de mest udbudte kategorier og de nye tendenser fra den seneste uge, før du målretter dit næste søgeord.
								</p>
							</div>

							<div className="space-y-3">
								{[
									"Brug de mest aktive kategorier som inspiration til nye søgninger.",
									"Sammenlign efterspørgsel med din profil og dine kompetencer.",
									"Tilpas jobagenten, når du ser ændringer i markedet.",
								].map((tip) => (
									<div key={tip} className="flex items-start gap-3 text-sm leading-6 text-secondary-content/88 sm:text-base">
										<CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-secondary-content" aria-hidden="true" />
										<span>{tip}</span>
									</div>
								))}
							</div>

							<Link to="/jobsearch" className="btn btn-outline min-h-12 rounded-2xl border-secondary-content/70 text-secondary-content hover:border-secondary-content hover:bg-white/10">
								Se job og filtrér nu
							</Link>
						</div>
					</div>
				</section>
			</div>
		</div>
	);
};

export default Home;
