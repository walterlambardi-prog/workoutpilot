/**
 * Authentication store with Supabase integration
 *
 * Manages user authentication state using Supabase Auth (email/password)
 * - Session synced from Supabase Auth
 * - User data persisted to local storage
 * - Onboarding flow state
 *
 * @see config/supabase.ts for Supabase client configuration
 */

import type { Session, User } from "@supabase/supabase-js";
import { Platform } from "react-native";
import type { StateCreator } from "zustand";

import { supabase } from "@/config/supabase";
import { createCrossPlatformStorage } from "@/utils/storage";

const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

export interface AuthState {
  // Supabase session
  session: Session | null;
  user: User | null;

  // App-specific state
  hasCompletedOnboarding: boolean;
  _hasHydrated: boolean;
  username: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  signOut: () => Promise<void>;
  resetAuth: () => void;
}

const storage = createCrossPlatformStorage();

const storeCreator: StateCreator<AuthState> = (set, get) => ({
  session: null,
  user: null,
  hasCompletedOnboarding: false,
  username: null,
  // Avoid blocking web if storage access is restricted; native waits for hydration.
  _hasHydrated: Platform.OS === "web",

  setSession: (session) => {
    // Debug: Log user metadata to check if display_name is present
    if (session?.user?.user_metadata) {
      console.log("[AuthStore] User metadata:", session.user.user_metadata);
    }

    // Extract username from user metadata
    const username =
      (session?.user?.user_metadata?.display_name as string | undefined) ??
      null;

    set({
      session,
      user: session?.user ?? null,
      username,
      // Sync hasCompletedOnboarding from Supabase user metadata
      hasCompletedOnboarding:
        session?.user?.user_metadata?.has_completed_onboarding === true,
    });
  },

  setHasCompletedOnboarding: (hasCompletedOnboarding) =>
    set({ hasCompletedOnboarding }),

  setHasHydrated: (hasHydrated) => set({ _hasHydrated: hasHydrated }),

  signOut: async () => {
    try {
      await supabase.auth.signOut();
      set({
        session: null,
        user: null,
        username: null,
        hasCompletedOnboarding: false,
      });
    } catch (error) {
      console.error("[AuthStore] Sign out failed:", error);
      throw error;
    }
  },

  resetAuth: () =>
    set({
      session: null,
      user: null,
      username: null,
      hasCompletedOnboarding: false,
    }),
});

export const useAuthStore = createFn(
  persist(storeCreator, {
    name: "workoutpilot-auth",
    storage,
    // Only persist onboarding state; session is managed by Supabase
    partialize: (state: AuthState) => ({
      hasCompletedOnboarding: state.hasCompletedOnboarding,
    }),
    onRehydrateStorage:
      () => (state: AuthState | undefined, error?: unknown) => {
        if (error) {
          console.error("[AuthStore] Rehydrate failed", error);
        }
        state?.setHasHydrated(true);
      },
  }),
);

/**
 * Initialize auth state listener
 * Must be called once in app root (_layout.tsx)
 */
export const initializeAuth = () => {
  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    useAuthStore.getState().setSession(session);
  });

  // Listen to auth changes
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    useAuthStore.getState().setSession(session);
  });

  return subscription;
};
