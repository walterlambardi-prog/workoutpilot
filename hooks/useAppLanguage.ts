import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import {
  changeAppLanguage,
  DEFAULT_LANGUAGE,
  getActiveLanguage,
  getSystemLanguage,
  resolveLanguageTag,
  SUPPORTED_LANGUAGES,
  type SupportedLanguage,
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
  const hasHydrated = usePreferencesStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );
  const [initialized, setInitialized] = useState(false);

  // Initialize language from store or system after hydration (only once)
  useEffect(() => {
    if (!hasHydrated || initialized) {
      return; // Wait for store to hydrate or already initialized
    }

    const initLanguage = async () => {
      if (storedLanguage === null) {
        // First time: use system language and save it
        const systemLanguage = getSystemLanguage();
        console.log(
          "[useAppLanguage] First time - setting system language:",
          systemLanguage,
        );
        setStoredLanguage(systemLanguage);
        if (systemLanguage !== i18n.language) {
          await changeAppLanguage(systemLanguage);
        }
      } else {
        // Use stored preference
        console.log("[useAppLanguage] Using stored language:", storedLanguage);
        if (storedLanguage !== i18n.language) {
          await changeAppLanguage(storedLanguage);
        }
      }
      setInitialized(true);
    };

    initLanguage();
  }, [hasHydrated, initialized, storedLanguage, setStoredLanguage, i18n]);

  useEffect(() => {
    const handleLanguageChanged = (lng: string) => {
      setLanguage(resolveLanguageTag(lng) ?? DEFAULT_LANGUAGE);
    };

    i18n.on("languageChanged", handleLanguageChanged);

    return () => {
      i18n.off("languageChanged", handleLanguageChanged);
    };
  }, [i18n]);

  // Sync local state with stored language after hydration
  useEffect(() => {
    if (hasHydrated && storedLanguage !== null) {
      setLanguage(storedLanguage);
    }
  }, [hasHydrated, storedLanguage]);

  const changeLanguage = useCallback(
    (nextLanguage: SupportedLanguage) => {
      if (nextLanguage === language) {
        return;
      }

      console.log("[useAppLanguage] Changing language to:", nextLanguage);
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
