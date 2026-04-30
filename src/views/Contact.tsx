import React, { useState } from "react";
import {
    EnvelopeIcon,
    ChatBubbleLeftRightIcon,
    BuildingOffice2Icon,
    PhoneIcon,
    ArrowRightIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import illuContact from "../assets/illustrations/undraw_contact_support.svg";
import illuUpdate from "../assets/illustrations/undraw_my-notifications.svg";
import Seo from "../components/Seo";
import { createNewsletterClient } from "../helpers/ApiFactory";

const contactMethods = [
    {
        title: "Support",
        description: "Skriv til os, hvis du har spørgsmål til din profil, ansøgninger, CV-analyse, eller oplever problemer.",
        detail: "support@findjob.nu",
        badge: "Vi bestræber os på at svare inden for to arbejdsdage",
        Icon: ChatBubbleLeftRightIcon,
    },
    {
        title: "Virksomhedssamarbejder",
        description: "Lad os tale om rekruttering, employer branding eller talentprogrammer.",
        detail: "partners@findjob.nu",
        badge: "Skræddersyede løsninger",
        Icon: BuildingOffice2Icon,
    },
    {
        title: "Telefon",
        description: "Ring til os på hverdage mellem 9 og 16 (GMT+1).",
        detail: "+45 70 12 34 56",
        badge: "Direkte kontakt",
        Icon: PhoneIcon,
    },
];

const faqs = [
    {
        question: "Hvornår får jeg svar?",
        answer:
            "Vi bestræber os på at besvare alle henvendelser inden for én arbejdsdag. Skriv gerne så præcist som muligt, så kan vi hjælpe hurtigere.",
    },
    {
        question: "Kan I hjælpe med at skrive mit CV?",
        answer:
            "Vi tilbyder ikke ghostwriting, men du finder guider, læsbarhedsanalyse og feedbackskabeloner, så du kan gøre det selv.",
    },
    {
        question: "Hvordan bliver jeg partner?",
        answer:
            "Send os en mail med en kort introduktion, så vender vores partnerskabsteam tilbage med et mødeforslag.",
    },
];

const getQuickContactTitle = (title: string) => {
    switch (title) {
        case "Support":
            return "Profil og produkt";
        case "Virksomhedssamarbejder":
            return "Rekruttering og brand";
        default:
            return "Hverdage 9-16";
    }
};

const Contact: React.FC = () => {
    const [contactName, setContactName] = useState("");
    const [contactEmail, setContactEmail] = useState("");
    const [message, setMessage] = useState("");
    const [newsletterEmail, setNewsletterEmail] = useState("");
    const [newsletterStatus, setNewsletterStatus] = useState<"idle" | "loading" | "success" | "exists" | "error">("idle");
    const [newsletterError, setNewsletterError] = useState<string | null>(null);

    const isContactFormValid = contactName.trim().length > 0
        && contactEmail.trim().length > 0
        && message.trim().length > 0;

    const handleNewsletterSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!newsletterEmail.trim()) return;
        setNewsletterStatus("loading");
        setNewsletterError(null);
        try {
            const api = createNewsletterClient();
            const res = await api.subscribeNewsletter({
                newsletterSubscribeRequest: { email: newsletterEmail.trim() }
            });
            if (res.alreadySubscribed) {
                setNewsletterStatus("exists");
            } else {
                setNewsletterStatus("success");
            }
        } catch (err) {
            console.error("Newsletter subscribe failed", err);
            setNewsletterStatus("error");
            setNewsletterError("Kunne ikke tilmelde nyhedsbrevet lige nu. Prøv igen senere.");
        }
    };

    const inputClass = "input input-bordered w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-base-content/45";
    const textareaClass = "textarea textarea-bordered min-h-36 w-full rounded-2xl border-base-300/80 bg-base-100/90 text-base shadow-sm transition-all duration-200 hover:border-base-content/40 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10 placeholder:text-base-content/45";
    const labelTextClass = "label-text text-sm font-semibold uppercase tracking-[0.16em] text-base-content/60";

    const detailHref = (detail: string) => {
        if (detail.includes("@")) return `mailto:${detail}`;
        if (detail.startsWith("+")) return `tel:${detail.replace(/\s+/g, "")}`;
        return undefined;
    };

    return (
        <div className="container max-w-7xl mx-auto px-4 py-8 prose prose-neutral">
            <Seo
                title="Kontakt FindJob.nu – Support, partnerskab og feedback"
                description="Kontakt FindJob.nu for support, partnerskaber eller feedback. Vi svarer normalt inden for én arbejdsdag."
                path="/contact"
                jsonLd={{
                    "@context": "https://schema.org",
                    "@type": "ContactPage",
                    name: "Kontakt FindJob.nu",
                    url: "https://findjob.nu/contact",
                    mainEntity: {
                        "@type": "Organization",
                        name: "FindJob.nu",
                        url: "https://findjob.nu/",
                        contactPoint: {
                            "@type": "ContactPoint",
                            email: "support@findjob.nu",
                            contactType: "customer support",
                            areaServed: "DK",
                            availableLanguage: ["da", "en"]
                        }
                    }
                }}
            />
            <div className="not-prose space-y-10">
                <section className="relative overflow-hidden rounded-[2rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.45)]">
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.75),transparent_52%)]" />
                    <div className="pointer-events-none absolute -left-10 bottom-0 h-40 w-40 rounded-full bg-primary/10 blur-3xl" />
                    <div className="pointer-events-none absolute -right-8 top-8 h-48 w-48 rounded-full bg-secondary/15 blur-3xl" />

                    <div className="relative grid gap-6 p-5 sm:p-7 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] lg:p-8">
                        <div className="space-y-6">
                            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-primary shadow-sm backdrop-blur">
                                <EnvelopeIcon className="h-4 w-4" aria-hidden="true" />
                                Kontakt FindJob.nu
                            </div>

                            <div className="space-y-3">
                                <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-base-content sm:text-4xl lg:text-[2.9rem]">
                                    Hurtig hjælp, klare kontaktveje og plads til feedback
                                </h1>
                                <p className="max-w-2xl text-base leading-7 text-base-content/72 sm:text-lg">
                                    Uanset om du har brug for support, vil tale partnerskab eller bare sende en idé, er kontaktoplevelsen gjort tydeligere og hurtigere at skimme.
                                </p>
                            </div>

                            <div className="flex flex-wrap gap-2 text-sm text-base-content/72">
                                <span className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-base-100/80 px-3 py-1.5 shadow-sm">Support</span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">Partnerskab</span>
                                <span className="inline-flex items-center gap-2 rounded-full border border-base-300/80 bg-base-100/80 px-3 py-1.5 shadow-sm">Feedback</span>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-3">
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Kanaler</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">{contactMethods.length}</p>
                                    <p className="text-sm text-base-content/65">måder at kontakte os på</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">Svar</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">1-2 dage</p>
                                    <p className="text-sm text-base-content/65">typisk svartid</p>
                                </div>
                                <div className="rounded-[1.35rem] border border-base-300/70 bg-base-100/80 p-4 shadow-sm">
                                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-base-content/45">FAQ</p>
                                    <p className="mt-2 text-2xl font-semibold text-base-content">{faqs.length}</p>
                                    <p className="text-sm text-base-content/65">hurtige svar klar</p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 sm:flex-row">
                                <a href="#contact-form" className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20">
                                    Skriv til os
                                    <ArrowRightIcon className="h-5 w-5" aria-hidden="true" />
                                </a>
                                <a href="mailto:support@findjob.nu" className="btn btn-ghost min-h-12 rounded-2xl border border-base-300/80 bg-base-100/75 px-6 shadow-sm">
                                    support@findjob.nu
                                </a>
                            </div>
                        </div>

                        <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/82 p-4 shadow-lg backdrop-blur-xl sm:p-5">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Sådan får du hurtigst hjælp</p>
                                <h2 className="text-2xl font-semibold tracking-tight text-base-content">Vælg den rigtige kanal fra start</h2>
                                <p className="text-sm leading-6 text-base-content/68">
                                    Brug support til produktspørgsmål, partnerskab ved virksomhedshenvendelser og formularen til feedback, fejl eller idéer.
                                </p>
                            </div>

                            <div className="mt-5 space-y-3">
                                {contactMethods.map((method) => {
                                    const quickTitle = getQuickContactTitle(method.title);

                                    return (
                                        <div key={`quick-${method.title}`} className="rounded-[1.35rem] border border-base-300/70 bg-gradient-to-br from-base-100 to-primary/5 p-4 shadow-sm">
                                            <div className="flex items-start gap-3">
                                                <div className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                                    <method.Icon className="h-5 w-5" aria-hidden="true" />
                                                </div>
                                                <div className="space-y-1">
                                                    <p className="text-base font-semibold text-base-content">{quickTitle}</p>
                                                    <p className="text-sm leading-6 text-base-content/68">{method.badge}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-5">
                    <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Kontaktkanaler</p>
                        <h2 className="text-2xl font-semibold tracking-tight text-base-content sm:text-[2rem]">Vælg den kanal der passer bedst til din henvendelse</h2>
                        <p className="max-w-2xl text-base leading-7 text-base-content/70">
                            Hver kontaktvej er gjort tydeligere, så du hurtigt kan se, hvor du skal skrive eller ringe afhængigt af din situation.
                        </p>
                    </div>

                    <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {contactMethods.map((method, index) => {
                            const href = detailHref(method.detail);

                            return (
                                <article
                                    key={method.title}
                                    className="group relative overflow-hidden rounded-[1.75rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_22px_60px_-42px_rgba(15,23,42,0.58)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_30px_72px_-42px_rgba(15,23,42,0.64)]"
                                >
                                    <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.72),transparent_58%)]" />
                                    <div className="relative flex h-full flex-col p-5 sm:p-6">
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                                                <method.Icon className="h-7 w-7" aria-hidden="true" />
                                            </div>
                                            <span className="rounded-full border border-base-300/70 bg-base-100/80 px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-base-content/45">
                                                {String(index + 1).padStart(2, "0")}
                                            </span>
                                        </div>

                                        <div className="mt-5 space-y-3">
                                            <h3 className="text-xl font-semibold text-base-content sm:text-2xl">{method.title}</h3>
                                            <p className="text-base leading-7 text-base-content/72">{method.description}</p>
                                        </div>

                                        {href ? (
                                            <a href={href} className="mt-5 text-lg font-semibold text-primary underline-offset-4 hover:underline">
                                                {method.detail}
                                            </a>
                                        ) : (
                                            <div className="mt-5 text-lg font-semibold text-primary">{method.detail}</div>
                                        )}

                                        <div className="mt-auto pt-5">
                                            <span className="inline-flex rounded-full border border-base-300/80 bg-base-100/80 px-3 py-2 text-sm text-base-content/70">
                                                {method.badge}
                                            </span>
                                        </div>
                                    </div>
                                </article>
                            );
                        })}
                    </div>
                </section>

                <section id="contact-form" className="overflow-hidden rounded-[1.9rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.5)]">
                    <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[minmax(260px,0.85fr)_minmax(0,1.15fr)] lg:items-center lg:p-8">
                        <figure className="rounded-[1.75rem] border border-base-300/70 bg-base-100/82 p-5 shadow-lg">
                            <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">Feedback og support</p>
                            <img
                                src={illuContact}
                                alt="Illustration af kontakt"
                                className="mx-auto h-72 w-full object-contain"
                                loading="lazy"
                            />
                        </figure>

                        <div className="rounded-[1.75rem] border border-base-300/70 bg-base-100/84 p-5 shadow-lg backdrop-blur-xl sm:p-6">
                            <div className="space-y-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Kontaktformular</p>
                                <h2 className="text-2xl font-semibold tracking-tight text-base-content">Send os en besked</h2>
                                <p className="text-base leading-7 text-base-content/70">
                                    Brug formularen, hvis du vil dele feedback, fejl eller idéer. Vi læser alt og svarer hurtigst muligt.
                                </p>
                            </div>

                            <form className="mt-6" aria-label="Kontaktformular" onSubmit={(event) => event.preventDefault()}>
                                <fieldset className="grid gap-4">
                                    <legend className="sr-only">Send os en besked</legend>

                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="form-control gap-2">
                                            <label className="label p-0" htmlFor="contact-name">
                                                <span className={labelTextClass}>Navn</span>
                                            </label>
                                            <input
                                                id="contact-name"
                                                type="text"
                                                className={inputClass}
                                                placeholder="Dit navn"
                                                value={contactName}
                                                onChange={(event) => setContactName(event.target.value)}
                                                required
                                            />
                                        </div>

                                        <div className="form-control gap-2">
                                            <label className="label p-0" htmlFor="contact-email">
                                                <span className={labelTextClass}>E-mail</span>
                                            </label>
                                            <input
                                                id="contact-email"
                                                type="email"
                                                className={inputClass}
                                                placeholder="dig@eksempel.dk"
                                                value={contactEmail}
                                                onChange={(event) => setContactEmail(event.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="form-control gap-2">
                                        <label className="label p-0" htmlFor="contact-message">
                                            <span className={labelTextClass}>Besked</span>
                                        </label>
                                        <textarea
                                            id="contact-message"
                                            className={textareaClass}
                                            placeholder="Fortæl os hvad du har på hjertet"
                                            value={message}
                                            onChange={(event) => setMessage(event.target.value)}
                                            required
                                        />
                                        <p className="text-sm leading-6 text-base-content/60">Jo mere præcist du beskriver problemet eller idéen, desto hurtigere kan vi hjælpe.</p>
                                    </div>

                                    <button type="submit" className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20" disabled={!isContactFormValid}>
                                        Send besked
                                    </button>
                                </fieldset>
                            </form>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] xl:items-start">
                    <div className="rounded-[1.9rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 p-5 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.5)] sm:p-6 lg:p-8">
                        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(240px,0.85fr)] lg:items-center">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">Nyhedsbrev</p>
                                    <h3 className="text-2xl font-semibold tracking-tight text-base-content">Hold dig opdateret</h3>
                                    <p className="text-base leading-7 text-base-content/70">
                                        Vi deler hver måned et kort overblik over nye funktioner, workshops og indsigter fra jobmarkedet. Tilmeld dig direkte her.
                                    </p>
                                </div>

                                <ul className="space-y-3">
                                    <li className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                        <span>Produktnyheder og vejledninger</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                        <span>Events og webinarer for kandidater og virksomheder</span>
                                    </li>
                                    <li className="flex items-start gap-3 text-sm leading-6 text-base-content/72 sm:text-base">
                                        <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-success" aria-hidden="true" />
                                        <span>Tips til at få mest muligt ud af Findjobnu</span>
                                    </li>
                                </ul>

                                <form className="space-y-3" onSubmit={handleNewsletterSubmit} aria-label="Nyhedsbrev">
                                    <label className="label p-0" htmlFor="newsletter-email">
                                        <span className={labelTextClass}>Tilmeld nyhedsbrevet</span>
                                    </label>
                                    <div className="flex flex-col gap-3 sm:flex-row">
                                        <input
                                            id="newsletter-email"
                                            type="email"
                                            required
                                            className={inputClass}
                                            placeholder="din@email.dk"
                                            value={newsletterEmail}
                                            onChange={(e) => setNewsletterEmail(e.target.value)}
                                            aria-describedby="newsletter-help"
                                        />
                                        <button
                                            type="submit"
                                            className="btn btn-primary min-h-12 rounded-2xl px-6 shadow-lg shadow-primary/20"
                                            disabled={newsletterStatus === "loading"}
                                        >
                                            {newsletterStatus === "loading" ? "Tilmelder..." : "Tilmeld"}
                                        </button>
                                    </div>
                                    <p id="newsletter-help" className="text-sm leading-6 text-base-content/60">Du kan afmelde dig når som helst via link i e-mailen.</p>
                                    {newsletterStatus === "success" && (
                                        <div className="alert alert-success rounded-2xl">
                                            <span>Tak! Du er tilmeldt nyhedsbrevet.</span>
                                        </div>
                                    )}
                                    {newsletterStatus === "exists" && (
                                        <div className="alert alert-info rounded-2xl">
                                            <span>Du er allerede tilmeldt nyhedsbrevet.</span>
                                        </div>
                                    )}
                                    {newsletterStatus === "error" && (
                                        <div className="alert alert-error rounded-2xl">
                                            <span>{newsletterError}</span>
                                        </div>
                                    )}
                                </form>
                            </div>

                            <figure className="rounded-[1.6rem] border border-base-300/70 bg-base-100/82 p-5 text-center shadow-lg">
                                <p className="mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-base-content/45">Månedlige opdateringer</p>
                                <img
                                    src={illuUpdate}
                                    alt="Illustration af nyheder"
                                    className="mx-auto h-64 w-full object-contain"
                                    loading="lazy"
                                />
                            </figure>
                        </div>
                    </div>

                    <div className="rounded-[1.9rem] border border-primary/15 bg-gradient-to-br from-base-100 via-primary/5 to-secondary/10 p-5 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.5)] sm:p-6 lg:p-8">
                        <div className="space-y-2">
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary/80">FAQ</p>
                            <h3 className="text-2xl font-semibold tracking-tight text-base-content">Ofte stillede spørgsmål</h3>
                            <p className="text-base leading-7 text-base-content/70">
                                Her er de korte svar på de spørgsmål, vi får oftest om support, CV-hjælp og partnerskaber.
                            </p>
                        </div>

                        <div className="mt-6 space-y-3">
                            {faqs.map((faq) => (
                                <details key={faq.question} className="collapse collapse-arrow rounded-[1.5rem] border border-base-300/70 bg-base-100/85 shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                                    <summary className="collapse-title text-lg font-semibold">{faq.question}</summary>
                                    <div className="collapse-content text-base leading-7 text-base-content/70">
                                        <p>{faq.answer}</p>
                                    </div>
                                </details>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Contact;
