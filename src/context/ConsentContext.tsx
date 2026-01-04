import React, { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { ConsentContext, type ConsentPreferences, type ConsentStatus } from "./ConsentContext.shared";

const STORAGE_KEY = "fj-consent-preferences";

function isValidConsent(value: unknown): value is ConsentPreferences {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ConsentPreferences>;
  return candidate.necessary === true && typeof candidate.ads === "boolean" && typeof candidate.analytics === "boolean";
}

function readConsentFromStorage(): ConsentPreferences | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isValidConsent(parsed)) return parsed;
    return null;
  } catch {
    return null;
  }
}

function writeConsentToStorage(consent: ConsentPreferences | null) {
  try {
    if (!consent) {
      localStorage.removeItem(STORAGE_KEY);
      return;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    // Ignore storage failures (private mode, etc.)
  }
}

function updateGoogleConsent(consent: ConsentPreferences) {
  const adValue = consent.ads ? "granted" : "denied";
  const analyticsValue = consent.analytics ? "granted" : "denied";

  const w = globalThis as typeof globalThis & { gtag?: (...args: unknown[]) => void; dataLayer?: unknown[] };
  if (typeof w.gtag === "function") {
    w.gtag("consent", "update", {
      ad_storage: adValue,
      ad_user_data: adValue,
      ad_personalization: adValue,
      analytics_storage: analyticsValue,
      functionality_storage: "granted",
      security_storage: "granted",
    });
  }

  if (Array.isArray(w.dataLayer)) {
    w.dataLayer.push({
      event: "consent_update",
      ad_storage: adValue,
      ad_user_data: adValue,
      ad_personalization: adValue,
      analytics_storage: analyticsValue,
    });
  }
}

export const ConsentProvider = ({ children }: { children: ReactNode }) => {
  const [consent, setConsent] = useState<ConsentPreferences | null>(() => readConsentFromStorage());
  const [isManagerOpen, setIsManagerOpen] = useState(() => readConsentFromStorage() == null);

  const status: ConsentStatus = consent ? "saved" : "unknown";

  const updateConsent = (prefs: Pick<ConsentPreferences, "ads" | "analytics">) => {
    const next: ConsentPreferences = {
      necessary: true,
      ads: Boolean(prefs.ads),
      analytics: Boolean(prefs.analytics),
      updatedAt: new Date().toISOString(),
    };
    setConsent(next);
    setIsManagerOpen(false);
    writeConsentToStorage(next);
    updateGoogleConsent(next);
  };

  useEffect(() => {
    if (!consent) return;
    writeConsentToStorage(consent);
    updateGoogleConsent(consent);
  }, [consent]);

  useEffect(() => {
    if (consent) return;
    updateGoogleConsent({ necessary: true, ads: false, analytics: false });
  }, [consent]);

  const contextValue = useMemo(
    () => ({
      consent,
      status,
      isManagerOpen,
      openManager: () => setIsManagerOpen(true),
      closeManager: () => setIsManagerOpen(false),
      updateConsent,
    }),
    [consent, status, isManagerOpen]
  );

  return <ConsentContext.Provider value={contextValue}>{children}</ConsentContext.Provider>;
};
