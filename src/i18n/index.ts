import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import ru from "./locales/ru.json";
import en from "./locales/en.json";
import es from "./locales/es.json";

// MASAMASA_LANGUAGE_BRIDGE_V1: keep language across SPA and static About pages.
const LANGUAGE_KEY = "masamasa.language";
type MasaMasaLanguage = "ru" | "en" | "es";

function supportedLanguage(value: string | null | undefined): MasaMasaLanguage | null {
  const code = value?.trim().toLowerCase().split("-")[0];
  return code === "ru" || code === "en" || code === "es" ? code : null;
}

function savedLanguage(): MasaMasaLanguage | null {
  if (typeof window === "undefined") return null;
  try {
    return supportedLanguage(window.localStorage.getItem(LANGUAGE_KEY));
  } catch {
    return null;
  }
}

const urlLanguage = typeof window === "undefined"
  ? null
  : supportedLanguage(new URLSearchParams(window.location.search).get("lang"));
const initialLanguage: MasaMasaLanguage = urlLanguage ?? savedLanguage() ?? "ru";

function rememberLanguage(value: string): void {
  const lang = supportedLanguage(value);
  if (!lang || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LANGUAGE_KEY, lang);
  } catch {
    // Browser storage may be blocked; the URL still carries the selected language.
  }
  const currentUrl = new URL(window.location.href);
  // If arriving via an About link, keep ?lang= in sync with the language switcher.
  if (currentUrl.searchParams.has("lang") && currentUrl.searchParams.get("lang") !== lang) {
    currentUrl.searchParams.set("lang", lang);
    window.history.replaceState(window.history.state, "", currentUrl.pathname + currentUrl.search + currentUrl.hash);
  }
}

i18n.use(initReactI18next).init({
  resources: {
    ru: { translation: ru },
    en: { translation: en },
    es: { translation: es },
  },
  lng: initialLanguage,
  fallbackLng: "ru",
  interpolation: {
    escapeValue: false, // React сам экранирует
  },
});

i18n.on("languageChanged", rememberLanguage);
rememberLanguage(initialLanguage);

export default i18n;