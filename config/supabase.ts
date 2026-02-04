/**
 * Supabase client configuration for WorkoutPilot (MOBILE ONLY)
 *
 * Uses expo-sqlite for session storage on iOS/Android
 * For web, see supabase.web.ts which uses native browser localStorage
 *
 * Metro will automatically use supabase.web.ts for web builds
 *
 * @see https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native
 */

import "expo-sqlite/localStorage/install";

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase environment variables. Please check .env file and ensure EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY are set.",
  );
}

/** (Mobile)
 * - Configured to use localStorage (expo-sqlite polyfill) for session storage
 * - Auto-refresh enabledlite polyfill) for session storage
 * - Auto-refresh enabled for web and mobile
 * - Session persisted across app restarts
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Not needed for mobile apps
  },
});
