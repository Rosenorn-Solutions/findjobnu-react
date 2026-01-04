import React, { useEffect, useState } from "react";
import { useConsent } from "../context/ConsentContext.shared";

const ConsentMessage: React.FC = () => {
  const { consent, status, isManagerOpen, openManager, closeManager, updateConsent } = useConsent();
  const [adsAllowed, setAdsAllowed] = useState(() => consent?.ads ?? false);
  const [analyticsAllowed, setAnalyticsAllowed] = useState(() => consent?.analytics ?? false);

  useEffect(() => {
    if (consent) {
      setAdsAllowed(consent.ads);
      setAnalyticsAllowed(consent.analytics);
    }
  }, [consent]);

  useEffect(() => {
    if (status === "unknown") openManager();
  }, [status, openManager]);

  const shouldShow = isManagerOpen || status === "unknown";
  if (!shouldShow) return null;

  const acceptAll = () => {
    updateConsent({ ads: true, analytics: true });
  };

  const rejectAll = () => {
    updateConsent({ ads: false, analytics: false });
  };

  const saveChoices = () => {
    updateConsent({ ads: adsAllowed, analytics: analyticsAllowed });
  };

  return (
    <div className="fixed inset-x-3 bottom-3 md:inset-x-auto md:left-6 md:right-6 z-50">
      <div className="card bg-base-100 shadow-2xl border border-base-300 md:max-w-5xl mx-auto">
        <div className="card-body gap-4">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wide text-primary font-semibold">Samtykke til cookies og annoncer</p>
              <h2 className="card-title">Vi respekterer dit privatliv</h2>
              <p className="text-sm text-base-content/80 max-w-3xl">
                Vi bruger nødvendige cookies til at drive siden. Med dit samtykke anvender vi også Google Ads til sponsorerede jobopslag
                og begrænsede analyser for at forbedre oplevelsen. Ingen personlige data sælges, og du kan altid ændre dit valg.
              </p>
            </div>
            <button type="button" aria-label="Luk samtykkemeddelelse" className="btn btn-ghost btn-sm" onClick={closeManager}>
              ✕
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mt-1"
                checked={adsAllowed}
                onChange={e => setAdsAllowed(e.target.checked)}
              />
              <div className="space-y-1">
                <p className="font-semibold">Annonce- og måle-cookies</p>
                <p className="text-sm text-base-content/80">
                  Muliggør visning af Google-annoncer og måling af annonceeffekt. Google kan modtage data for at levere mere relevante eller
                  begrænsede annoncer. Kræver samtykke.
                </p>
              </div>
            </label>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="checkbox checkbox-primary mt-1"
                checked={analyticsAllowed}
                onChange={e => setAnalyticsAllowed(e.target.checked)}
              />
              <div className="space-y-1">
                <p className="font-semibold">Ydeevne og statistik</p>
                <p className="text-sm text-base-content/80">
                  Hjælper os med at forstå brugen af sitet og forbedre funktioner. Vi bruger kun aggregerede målinger. Kræver samtykke.
                </p>
              </div>
            </label>
          </div>

          <div className="text-xs text-base-content/70 border border-base-300 rounded-lg p-3 bg-base-200/60">
            Nødvendige cookies er altid aktive for at sikre login, sikkerhed og basisfunktioner. Læs mere i vores
            {' '}<a href="/privatlivspolitik" className="link" target="_blank" rel="noreferrer">privatlivspolitik</a>{' '}og
            {' '}<a href="/cookie-information" className="link" target="_blank" rel="noreferrer">cookie-information</a>.
          </div>

          <div className="flex flex-wrap gap-3 justify-end">
            <button type="button" className="btn btn-outline btn-sm" onClick={rejectAll}>
              Afvis ikke-nødvendige
            </button>
            <button type="button" className="btn btn-secondary btn-sm" onClick={saveChoices}>
              Gem valg
            </button>
            <button type="button" className="btn btn-primary btn-sm" onClick={acceptAll}>
              Accepter alle
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsentMessage;
