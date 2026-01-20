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

  // Initialize theme from system if not set
  useEffect(() => {
    if (themeMode === null && systemColorScheme) {
      setThemeMode(systemColorScheme as ThemeMode);
    }
  }, [themeMode, systemColorScheme, setThemeMode]);

  if (themeMode === null) {
    return systemColorScheme ?? "light";
  }

  return themeMode;
}
