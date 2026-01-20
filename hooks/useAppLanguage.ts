import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  changeAppLanguage,
  DEFAULT_LANGUAGE,
  getActiveLanguage,
  initializeLanguage,
  resolveLanguageTag,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage
} from "@/locales/i18n";
import { usePreferencesStore } from "@/stores/preferencesStore";

export const useAppLanguage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] =
    useState<SupportedLanguage>(getActiveLanguage());

  const storedLanguage = usePreferencesStore(
    (state: { language: SupportedLanguage | null }) => state.language,
  );
  const setStoredLanguage = usePreferencesStore(
    (state: { setLanguage: (language: SupportedLanguage) => void }) =>
      state.setLanguage,
  );

  // Initialize language from system if not set
  useEffect(() => {
    if (storedLanguage === null) {
      const systemLanguage = getActiveLanguage();
      setStoredLanguage(systemLanguage);
      initializeLanguage(systemLanguage);
    } else {
      initializeLanguage(storedLanguage);
    }
  }, [storedLanguage, setStoredLanguage]);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(resolveLanguageTag(lng) ?? DEFAULT_LANGUAGE);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  const changeLanguage = useCallback(
    (nextLanguage: SupportedLanguage) => {
      if (nextLanguage === language) {
        return;
      }

      setStoredLanguage(nextLanguage);
      changeAppLanguage(nextLanguage);
    },
    [language, setStoredLanguage],
  );

  const supportedLanguages = useMemo(() => [...SUPPORTED_LANGUAGES], []);

  return {
    language,
    changeLanguage,
    supportedLanguages,
  };
};
