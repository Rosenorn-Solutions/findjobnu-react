import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import da from "./locales/da.json";
import en from "./locales/en.json";

const resources = {
  da: { translation: da },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: "da",
    supportedLngs: ["da", "en"],
    interpolation: {
      escapeValue: false, // React already escapes
    },
    detection: {
      order: ["localStorage", "navigator"],
      lookupLocalStorage: "fj-language",
      caches: ["localStorage"],
    },
  });

export default i18n;
