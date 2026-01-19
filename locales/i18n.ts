import * as Localization from "expo-localization";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

import en from "./en.json";
import es from "./es.json";

export const SUPPORTED_LANGUAGES = ["en", "es"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];
export const DEFAULT_LANGUAGE: SupportedLanguage = "en";

const resources = {
  en: { translation: en },
  es: { translation: es },
} as const;

export const resolveLanguageTag = (
  languageTag?: string,
): SupportedLanguage | null => {
  if (!languageTag) {
    return null;
  }

  const normalized = languageTag.toLowerCase();
  const base = normalized.split("-")[0];

  if (SUPPORTED_LANGUAGES.includes(normalized as SupportedLanguage)) {
    return normalized as SupportedLanguage;
  }

  if (SUPPORTED_LANGUAGES.includes(base as SupportedLanguage)) {
    return base as SupportedLanguage;
  }

  return null;
};

const locales = Localization.getLocales();
const initialLanguage =
  resolveLanguageTag(locales?.[0]?.languageTag) ?? DEFAULT_LANGUAGE;

let hasManualLanguageOverride = false;

i18n.use(initReactI18next).init({
  resources,
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  compatibilityJSON: "v4",
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

const { addLocalizationListener } = Localization as {
  addLocalizationListener?: (listener: () => void) => void;
};

addLocalizationListener?.(() => {
  if (hasManualLanguageOverride) {
    return;
  }

  const nextLanguage = resolveLanguageTag(
    Localization.getLocales()?.[0]?.languageTag,
  );

  if (nextLanguage && nextLanguage !== i18n.language) {
    i18n.changeLanguage(nextLanguage);
  }
});

export const changeAppLanguage = async (language: SupportedLanguage) => {
  hasManualLanguageOverride = true;
  return i18n.changeLanguage(language);
};

export const getActiveLanguage = (): SupportedLanguage => {
  return resolveLanguageTag(i18n.language) ?? DEFAULT_LANGUAGE;
};

export { i18n };
