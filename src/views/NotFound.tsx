import React from "react";
import { Link } from "react-router-dom";
import Seo from "../components/Seo";

const NotFound: React.FC = () => {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-16">
      <Seo title="Siden blev ikke fundet" description="Siden blev ikke fundet" path="/404" noIndex />
      <div className="card bg-gradient-to-br from-primary/5 to-secondary/5 shadow-xl border border-primary/20 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1">
        <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
          <div className="p-8 sm:p-10 space-y-4 bg-gradient-to-br from-primary/10 via-base-100 to-base-200">
            <p className="badge badge-primary badge-outline">404</p>
            <h1 className="text-3xl sm:text-4xl font-bold">Siden blev ikke fundet</h1>
            <p className="text-base-content/80">
              Vi kunne ikke finde siden. Brug genvejene nedenfor for at komme videre til jobsøgning eller forsiden.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link to="/" className="btn btn-primary">Gå til forsiden</Link>
              <Link to="/jobsearch" className="btn btn-outline">Jobsøgning</Link>
              <Link to="/jobsearch?panel=recommended" className="btn btn-ghost">Anbefalede jobs</Link>
            </div>
          </div>
          <div className="p-8 sm:p-10 space-y-4">
            <div className="text-sm uppercase tracking-wide text-base-content/60">Hurtige links</div>
            <div className="flex flex-col gap-3">
              <Link to="/profile" className="link link-hover">Min profil</Link>
              <Link to="/profile?panel=jobAgent" className="link link-hover">Jobagent</Link>
              <Link to="/register" className="link link-hover">Opret bruger</Link>
              <Link to="/login" className="link link-hover">Log ind</Link>
            </div>
            <div className="divider" />
            <p className="text-sm text-base-content/70">
              Hvis du fulgte et gammelt link, kan du prøve at opdatere siden eller gå tilbage til forsiden.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
