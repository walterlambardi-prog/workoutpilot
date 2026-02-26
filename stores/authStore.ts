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
  /**
   * True only after the initial `supabase.auth.getSession()` has resolved.
   * Until this is true, `session` may be stale/null even for logged-in users.
   */
  _isAuthInitialized: boolean;
  username: string | null;

  // Actions
  setSession: (session: Session | null) => void;
  setHasCompletedOnboarding: (completed: boolean) => void;
  setHasHydrated: (hasHydrated: boolean) => void;
  setAuthInitialized: (initialized: boolean) => void;
  signOut: () => Promise<void>;
  resetAuth: () => void;
}

const storage = createCrossPlatformStorage();

const storeCreator: StateCreator<AuthState> = (set, get) => ({
  session: null,
  user: null,
  hasCompletedOnboarding: false,
  username: null,
  _hasHydrated: false,
  _isAuthInitialized: false,

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

  setAuthInitialized: (initialized) => set({ _isAuthInitialized: initialized }),

  signOut: async () => {
    try {
      // Import stores dynamically to avoid circular dependencies
      const { useRoutineSessionStore } = await import("./routineSessionStore");
      const { useRoutineBuilderStore } = await import("./routineBuilderStore");
      const { useStepTrackerStore } = await import("./stepTrackerStore");
      const { useExerciseSessionStore } =
        await import("./exerciseSessionStore");

      // Sign out from Supabase
      await supabase.auth.signOut();

      // Clear all user data from stores
      useRoutineSessionStore.getState().resetActive();
      useRoutineSessionStore.getState().resetHistory();
      useRoutineBuilderStore.getState().resetRoutine();
      useStepTrackerStore.getState().clearActiveSession();
      useStepTrackerStore.getState().resetHistory();
      useExerciseSessionStore.getState().resetHistory();

      // Clear auth state
      set({
        session: null,
        user: null,
        username: null,
        hasCompletedOnboarding: false,
      });

      console.log("[AuthStore] All stores cleared after sign out");
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
  // Get initial session — mark auth as initialized only after this resolves
  supabase.auth
    .getSession()
    .then(({ data: { session } }) => {
      const store = useAuthStore.getState();
      store.setSession(session);
      store.setAuthInitialized(true);
    })
    .catch((error) => {
      console.error("[AuthStore] getSession failed", error);
      // Still mark as initialized so the app doesn't stay on the loader forever
      useAuthStore.getState().setAuthInitialized(true);
    });

  // Listen to auth changes (sign-in, sign-out, token refresh)
  const {
    data: { subscription },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    const store = useAuthStore.getState();
    store.setSession(session);
    // If the listener fires before getSession, mark initialized
    if (!store._isAuthInitialized) {
      store.setAuthInitialized(true);
    }
  });

  return subscription;
};
