import type { StateCreator } from "zustand";

import type { SupportedLanguage } from "@/locales/i18n";
import { createCrossPlatformStorage } from "@/utils/storage";
import { Platform } from "react-native";

const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

export type ThemeMode = "light" | "dark";

interface PreferencesState {
  language: SupportedLanguage | null;
  themeMode: ThemeMode | null;
  _hasHydrated: boolean;
  setLanguage: (language: SupportedLanguage) => void;
  setThemeMode: (mode: ThemeMode) => void;
  clearLanguage: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

const storage = createCrossPlatformStorage();

const storeCreator: StateCreator<PreferencesState> = (set) => ({
  language: null,
  themeMode: null,
  // Avoid blocking web if storage access is restricted; native waits for hydration.
  _hasHydrated: Platform.OS === "web",
  setLanguage: (language) => {
    console.log("[PreferencesStore] Setting language to:", language);
    set({ language });
  },
  setThemeMode: (themeMode) => set({ themeMode }),
  clearLanguage: () => set({ language: null }),
  setHasHydrated: (hasHydrated) => {
    console.log("[PreferencesStore] Hydration complete");
    set({ _hasHydrated: hasHydrated });
  },
});

export const usePreferencesStore = createFn(
  persist(storeCreator, {
    name: "workoutpilot-preferences",
    storage,
    onRehydrateStorage:
      () => (state: PreferencesState | undefined, error?: unknown) => {
        if (error) {
          console.error("[PreferencesStore] Rehydrate failed", error);
        }
        state?.setHasHydrated(true);
      },
  }),
);

// Subscribe to store changes for Reactotron debugging (native only)
if (
  __DEV__ &&
  typeof navigator !== "undefined" &&
  navigator.product === "ReactNative"
) {
  const reactotron = require("@/config/reactotron").default;
  if (reactotron) {
    usePreferencesStore.subscribe((state: PreferencesState) => {
      reactotron?.display?.({
        name: "PreferencesStore",
        value: state,
        preview: `lang=${state.language ?? "-"} theme=${state.themeMode ?? "-"}`,
      });
    });
  }
}
