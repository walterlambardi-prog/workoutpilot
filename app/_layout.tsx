import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import "react-native-reanimated";
import { TamaguiProvider } from "tamagui";

import AppLoader from "@/components/AppLoader";
import { TAppHeader } from "@/components/TAppHeader";
import "@/config/initReactotron";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useColorScheme } from "@/hooks/useColorScheme";
import "@/locales/i18n";
import { useAuthStore } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { Platform } from "react-native";
import config from "../tamagui.config";

export default function RootLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  const preferencesHasHydrated = usePreferencesStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );
  const authHasHydrated = useAuthStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );
  const username = useAuthStore(
    (state: { username: string | null }) => state.username,
  );
  const hasCompletedOnboarding = useAuthStore(
    (state: { hasCompletedOnboarding: boolean }) =>
      state.hasCompletedOnboarding,
  );

  // Initialize language preference on app startup
  useAppLanguage();

  // Protected routes - handles authentication flow
  useEffect(() => {
    if (!authHasHydrated || !preferencesHasHydrated) return;

    // Mark navigation as ready after a small delay to ensure Stack is mounted
    const timer = setTimeout(() => {
      setIsNavigationReady(true);
    }, 100);

    return () => clearTimeout(timer);
  }, [authHasHydrated, preferencesHasHydrated]);

  useEffect(() => {
    if (!isNavigationReady) return;

    const inAuthGroup = segments[0] === "login" || segments[0] === "onboarding";

    // User needs to set username first
    if (!username) {
      if (segments[0] !== "login") {
        router.replace("/login");
      }
      return;
    }

    // User has username but needs to complete onboarding
    if (!hasCompletedOnboarding) {
      if (segments[0] !== "onboarding") {
        router.replace("/onboarding");
      }
      return;
    }

    // User is authenticated and onboarded, redirect away from auth screens
    if (inAuthGroup) {
      router.replace("/");
    }
  }, [username, hasCompletedOnboarding, isNavigationReady, segments, router]);

  // Show loader while stores are being loaded
  if (!preferencesHasHydrated || !authHasHydrated || !isNavigationReady) {
    return (
      <TamaguiProvider config={config} defaultTheme={colorScheme}>
        <AppLoader colorScheme={colorScheme} />
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme}>
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerShown: Platform.OS === "web" ? false : undefined,
          }}
        >
          <Stack.Screen name="login/index" options={{ headerShown: false }} />
          <Stack.Screen
            name="onboarding/index"
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="index"
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
          <Stack.Screen
            name="routine/index"
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
          <Stack.Screen
            name="routine/complete/index"
            //options={{ title: t("routineComplete.navTitle") }}
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
          <Stack.Screen
            name="exercises/index"
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
          <Stack.Screen
            name="exercises/[exerciseId]"
            options={{ title: t("navigation.exercises"), header: undefined }}
          />
          <Stack.Screen
            name="sessions/index"
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
          <Stack.Screen
            name="settings/index"
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
          <Stack.Screen
            name="aiCoach/index"
            //options={{ title: t("navigation.exercises"), header: undefined }}
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
          <Stack.Screen
            name="routineAnalysis/index"
            //options={{ title: t("routineAnalysis.title"), header: undefined }}
            options={{
              headerShown: true,
              header: () => <TAppHeader />,
            }}
          />
        </Stack>
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </TamaguiProvider>
  );
}
