import type { StateCreator } from "zustand";

import { createCrossPlatformStorage } from "@/utils/storage";
import { Platform } from "react-native";

const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

interface AuthState {
  username: string | null;
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;
  setUsername: (username: string) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  resetAuth: () => void;
}

const storage = createCrossPlatformStorage();

const storeCreator: StateCreator<AuthState> = (set) => ({
  username: null,
  hasCompletedOnboarding: false,
  // Avoid blocking web if storage access is restricted; native waits for hydration.
  _hasHydrated: Platform.OS === "web",
  setUsername: (username) => set({ username }),
  setHasCompletedOnboarding: (hasCompletedOnboarding) =>
    set({ hasCompletedOnboarding }),
  setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),
  resetAuth: () => set({ username: null, hasCompletedOnboarding: false }),
});

export const useAuthStore = createFn(
  persist(storeCreator, {
    name: "workoutpilot-auth",
    storage,
    onRehydrateStorage:
      () => (state: AuthState | undefined, error?: unknown) => {
        if (error) {
          console.error("[AuthStore] Rehydrate failed", error);
        }
        state?.setHasHydrated(true);
      },
  }),
);
