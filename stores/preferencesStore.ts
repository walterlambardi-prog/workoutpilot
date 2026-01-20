import type { StateCreator } from "zustand";

import type { SupportedLanguage } from "@/locales/i18n";

// Use require to force CJS entry (avoids import.meta in ESM build on web)
const { create: createFn } = require("zustand");
const { createJSONStorage, persist } = require("zustand/middleware");

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

const hasLocalStorage = typeof window !== "undefined" && !!window.localStorage;

const getAsyncStorage = async () => {
  const mod = await import("@react-native-async-storage/async-storage");
  return mod.default;
};

const storage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    if (hasLocalStorage) {
      return window.localStorage.getItem(name);
    }
    const AsyncStorage = await getAsyncStorage();
    return AsyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    if (hasLocalStorage) {
      window.localStorage.setItem(name, value);
      return;
    }
    const AsyncStorage = await getAsyncStorage();
    await AsyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    if (hasLocalStorage) {
      window.localStorage.removeItem(name);
      return;
    }
    const AsyncStorage = await getAsyncStorage();
    await AsyncStorage.removeItem(name);
  },
}));

const storeCreator: StateCreator<PreferencesState> = (set) => ({
  language: null,
  themeMode: null,
  _hasHydrated: false,
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
    onRehydrateStorage: () => (state: PreferencesState | undefined) => {
      console.log(
        "[PreferencesStore] Rehydrating from storage, language:",
        state?.language,
      );
      state?.setHasHydrated(true);
    },
  }),
);
