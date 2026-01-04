import React, { useEffect, useMemo, useRef, useState } from "react";

const GOOGLE_ADS_CLIENT = (import.meta.env.VITE_GOOGLE_ADS_CLIENT_ID as string | undefined)
  ?? (import.meta.env.VITE_GADS_CLIENT_ID as string | undefined);

interface AdWrapperProps {
  slotId?: string;
  layout?: "in-article" | "fluid" | "display";
  format?: string;
  className?: string;
  title?: string;
}

const AdWrapper: React.FC<AdWrapperProps> = ({
  slotId,
  layout = "in-article",
  format = "auto",
  className,
  title = "Sponsoreret jobannonce",
}) => {
  const [scriptReady, setScriptReady] = useState(false);
  const adRef = useRef<HTMLModElement | null>(null);
  const [renderError, setRenderError] = useState<string | null>(null);

  const canRequestAd = useMemo(() => Boolean(slotId && GOOGLE_ADS_CLIENT), [slotId]);

  useEffect(() => {
    if (!slotId || !GOOGLE_ADS_CLIENT) return;

    const existing = document.querySelector(`script[data-google-ads-client="${GOOGLE_ADS_CLIENT}"]`) as HTMLScriptElement | null;
    if (existing) {
      setScriptReady(true);
      return;
    }

    const script = document.createElement("script");
    script.async = true;
    script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${GOOGLE_ADS_CLIENT}`;
    script.crossOrigin = "anonymous";
    script.dataset.googleAdsClient = GOOGLE_ADS_CLIENT;
    script.dataset.adsbygoogle = "true";
    script.onload = () => setScriptReady(true);
    script.onerror = () => setRenderError("Kunne ikke hente Google Ads-scriptet.");
    document.head.appendChild(script);

    return () => {
      script.onload = null;
      script.onerror = null;
    };
  }, [slotId]);

  useEffect(() => {
    if (!canRequestAd || !scriptReady || !adRef.current) return;

    adRef.current.innerHTML = "";
    try {
      const ads = (globalThis as typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle ?? [];
      ads.push({});
      (globalThis as typeof globalThis & { adsbygoogle?: unknown[] }).adsbygoogle = ads;
      setRenderError(null);
    } catch {
      setRenderError("Annonceelementet kunne ikke initialiseres.");
    }
  }, [canRequestAd, scriptReady, slotId, layout, format]);

  const showPlaceholder = !canRequestAd;
  const needsConfig = !GOOGLE_ADS_CLIENT || !slotId;

  return (
    <div className={`card bg-base-100 shadow-xl border border-base-300 p-4 space-y-3 ${className ?? ""}`} data-testid="job-ad-card">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-primary font-semibold">Annonce</p>
          <h3 className="text-base font-semibold text-base-content leading-snug">{title}</h3>
          <p className="text-sm text-base-content/70">Vi viser sponsoreret indhold for at holde FindJob.nu gratis for brugerne.</p>
        </div>

      {renderError && <div className="text-sm text-red-600">{renderError}</div>}

      {showPlaceholder ? (
        <div className="rounded-lg border border-dashed border-base-300 bg-base-200/60 p-4 text-sm text-base-content/70">
          <p className="font-medium">Annonceplads</p>
          <p>Tilføj Google Ads klient og slot-id for at vise sponsorerede job.</p>
          {needsConfig && (
            <div className="text-xs text-amber-700 mt-2">
              {GOOGLE_ADS_CLIENT ? "Tilføj data-ad-slot i miljøet." : "Tilføj VITE_GOOGLE_ADS_CLIENT_ID i miljøet."}
            </div>
          )}
        </div>
      ) : (
        <ins
          className="adsbygoogle block w-full"
          style={{ display: "block", minHeight: "120px" }}
          data-ad-client={GOOGLE_ADS_CLIENT}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
          data-ad-layout={layout}
          ref={adRef}
        />
      )}

      <div className="text-xs text-base-content/60">
        Annoncevalg håndteres via din samtykkebesked (CMP). Opdater dit samtykke dér, hvis du vil ændre annoncering.
      </div>
    </div>
  );
};

export default AdWrapper;
