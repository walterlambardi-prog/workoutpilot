import { useEffect, useState } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

import { usePreferencesStore, type ThemeMode } from "@/stores/preferencesStore";

/**
 * To support static rendering, this value needs to be re-calculated on the client side for web
 */
export function useColorScheme() {
  const [hasHydrated, setHasHydrated] = useState(false);

  useEffect(() => {
    setHasHydrated(true);
  }, []);

  const systemColorScheme = useRNColorScheme();
  const themeMode = usePreferencesStore(
    (state: { themeMode: ThemeMode | null }) => state.themeMode,
  );
  const setThemeMode = usePreferencesStore(
    (state: { setThemeMode: (mode: ThemeMode) => void }) => state.setThemeMode,
  );

  // Initialize theme from system if not set (only after hydration)
  useEffect(() => {
    if (hasHydrated && themeMode === null && systemColorScheme) {
      setThemeMode(systemColorScheme as ThemeMode);
    }
  }, [hasHydrated, themeMode, systemColorScheme, setThemeMode]);

  if (!hasHydrated) {
    return "light";
  }

  if (themeMode === null) {
    return systemColorScheme ?? "light";
  }

  return themeMode;
}
