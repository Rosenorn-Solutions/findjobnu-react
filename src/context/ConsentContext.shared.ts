import { createContext, useContext } from "react";

export type ConsentPreferences = {
  necessary: true;
  ads: boolean;
  analytics: boolean;
  updatedAt?: string;
};

export type ConsentStatus = "unknown" | "saved";

export interface ConsentContextType {
  consent: ConsentPreferences | null;
  status: ConsentStatus;
  isManagerOpen: boolean;
  openManager: () => void;
  closeManager: () => void;
  updateConsent: (prefs: Pick<ConsentPreferences, "ads" | "analytics">) => void;
}

export const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

export const useConsent = () => {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error("useConsent must be used within a ConsentProvider");
  return ctx;
};
