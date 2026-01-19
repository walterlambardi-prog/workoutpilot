import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
    changeAppLanguage,
    DEFAULT_LANGUAGE,
    getActiveLanguage,
    resolveLanguageTag,
    SUPPORTED_LANGUAGES,
    type SupportedLanguage,
} from "@/locales/i18n";

export const useAppLanguage = () => {
  const { i18n } = useTranslation();
  const [language, setLanguage] =
    useState<SupportedLanguage>(getActiveLanguage());

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

      changeAppLanguage(nextLanguage);
    },
    [language],
  );

  const supportedLanguages = useMemo(() => [...SUPPORTED_LANGUAGES], []);

  return {
    language,
    changeLanguage,
    supportedLanguages,
  };
};
