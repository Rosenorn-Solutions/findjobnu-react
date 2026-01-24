import React from "react";
import Seo from "../components/Seo";

const sections = [
  {
    title: "FindJob.nu",
    links: [
      { label: "Forside", href: "/" },
      { label: "Værktøjer", href: "/vaerktoejer" },
      { label: "Joboversigt", href: "/jobsearch" },
      { label: "Mine job", href: "/profile/saved-jobs" },
    ],
  },
  {
    title: "Ressourcer",
    links: [
      { label: "Det gode CV", href: "/cv" },
      { label: "Om os", href: "/about" },
      { label: "Kontakt", href: "/contact" },
    ],
  },
  {
    title: "Konto",
    links: [
      { label: "Log ind", href: "/login" },
      { label: "Tilmeld", href: "/register" },
      { label: "Profil", href: "/profile" },
    ],
  },
  {
    title: "Juridisk",
    links: [
      { label: "Privatlivspolitik", href: "/privatlivspolitik" },
      { label: "Cookie-information", href: "/cookie-information" },
    ],
  },
];

const Sitemap: React.FC = () => {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Seo
        title="Sitemap | FindJob.nu"
        description="Overblik over FindJob.nu: jobsøgning, jobagent, CV-guide, kontakt, privatliv og mere."
        path="/sitemap"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "FindJob.nu Sitemap",
          itemListElement: sections.flatMap((section, sectionIndex) =>
            section.links.map((link, linkIndex) => ({
              "@type": "ListItem",
              position: sectionIndex * 10 + linkIndex + 1,
              name: link.label,
              url: `https://findjob.nu${link.href}`,
            }))
          ),
        }}
      />
      <div className="card bg-linear-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1">
        <div className="card-body space-y-2">
          <h1 className="text-3xl font-bold">Sitemap</h1>
          <p className="text-base-content/70">
            Få et hurtigt overblik over alle de vigtigste sider på FindJob.nu.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <div key={section.title} className="card bg-linear-to-br from-primary/5 to-secondary/5 shadow border border-primary/20 transition-all hover:shadow-xl hover:-translate-y-1">
            <div className="card-body space-y-2">
              <h2 className="text-xl font-semibold">{section.title}</h2>
              <ul className="space-y-1">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <a className="link" href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Sitemap;
