/**
 * Supabase client configuration for WorkoutPilot (WEB ONLY)
 *
 * Uses native browser localStorage for session storage
 * This file is used automatically on web builds via Metro's .web.ts extension
 *
 * @see https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.",
  );
}

/**
 * Custom storage implementation that safely handles SSR
 * Falls back to no-op storage during server-side rendering
 */
const browserStorage = {
  getItem: (key: string) => {
    if (typeof window === "undefined") return null;
    return window.localStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(key);
  },
};

/**
 * Supabase client instance (Web)
 * - Uses native browser localStorage with SSR safety
 * - Auto-refresh enabled
 * - Session persisted across browser refreshes
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: browserStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
