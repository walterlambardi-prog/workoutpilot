import { useEffect } from "react";
import { useColorScheme as useRNColorScheme } from "react-native";

import { usePreferencesStore, type ThemeMode } from "@/stores/preferencesStore";

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const themeMode = usePreferencesStore(
    (state: { themeMode: ThemeMode | null }) => state.themeMode,
  );
  const setThemeMode = usePreferencesStore(
    (state: { setThemeMode: (mode: ThemeMode) => void }) => state.setThemeMode,
  );
  const hasHydrated = usePreferencesStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );

  // Initialize theme from system if not set (after hydration)
  useEffect(() => {
    if (!hasHydrated) {
      return; // Wait for store to hydrate
    }

    if (themeMode === null && systemColorScheme) {
      setThemeMode(systemColorScheme as ThemeMode);
    }
  }, [hasHydrated, themeMode, systemColorScheme, setThemeMode]);

  if (themeMode === null) {
    return systemColorScheme ?? "light";
  }

  return themeMode;
}
