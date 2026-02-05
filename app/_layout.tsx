import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import "react-native-reanimated";
import { TamaguiProvider } from "tamagui";

import AppLoader from "@/components/AppLoader";
import { TAppHeader } from "@/components/TAppHeader";
import { TDrawer } from "@/components/TDrawer";
import "@/config/initReactotron";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSyncInitialization } from "@/hooks/useSyncInitialization";
import "@/locales/i18n";
import { initializeAuth, useAuthStore } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { Platform, Pressable } from "react-native";
import config from "../tamagui.config";
import { getDrawerButtonStyle } from "./navigation/navigation.styles";

export default function RootLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isNavigationReady, setIsNavigationReady] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isWeb = Platform.OS === "web";
  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  const preferencesHasHydrated = usePreferencesStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );
  const authHasHydrated = useAuthStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );
  const session = useAuthStore((state: { session: unknown }) => state.session);
  const hasCompletedOnboarding = useAuthStore(
    (state: { hasCompletedOnboarding: boolean }) =>
      state.hasCompletedOnboarding,
  );

  // Initialize Supabase auth listener
  useEffect(() => {
    const subscription = initializeAuth();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const openDrawer = useCallback(() => {
    setIsDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setIsDrawerOpen(false);
  }, []);

  const drawerState = useMemo(
    () => ({
      isOpen: isDrawerOpen,
      open: openDrawer,
      close: closeDrawer,
    }),
    [isDrawerOpen, openDrawer, closeDrawer],
  );

  const renderDrawerToggle = useCallback(
    () => (
      <Pressable
        onPress={openDrawer}
        style={getDrawerButtonStyle}
        accessibilityRole="button"
        accessibilityLabel={t("drawer.title")}
      >
        <Ionicons name="menu" size={24} color={navigationTheme.colors.text} />
      </Pressable>
    ),
    [navigationTheme.colors.text, openDrawer, t],
  );

  const appHeaderOptions = isWeb
    ? {
        headerShown: true,
        header: () => <TAppHeader drawerState={drawerState} />,
      }
    : {
        headerShown: true,
        headerRight: renderDrawerToggle,
      };

  // Initialize language preference on app startup
  useAppLanguage();

  // Initialize Supabase sync (loads history from cloud)
  const { syncStatus, isReady: isSyncReady } = useSyncInitialization();

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

    // User needs to authenticate first
    if (!session) {
      if (segments[0] !== "login") {
        router.replace("/login");
      }
      return;
    }

    // User is authenticated but needs to complete onboarding
    // Show onboarding only if user hasn't completed it (new signups)
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
  }, [session, hasCompletedOnboarding, isNavigationReady, segments, router]);

  // Show loader while stores are being loaded or data is syncing
  if (
    !preferencesHasHydrated ||
    !authHasHydrated ||
    !isNavigationReady ||
    (session && !isSyncReady && syncStatus === "loading")
  ) {
    return (
      <TamaguiProvider config={config} defaultTheme={colorScheme}>
        <AppLoader colorScheme={colorScheme} />
      </TamaguiProvider>
    );
  }

  return (
    <TamaguiProvider config={config} defaultTheme={colorScheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack
          screenOptions={{
            headerShown: !isWeb,
            headerBackButtonDisplayMode: "minimal",
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
              header: () => <TAppHeader drawerState={drawerState} />,
            }}
          />
          <Stack.Screen
            name="routine/index"
            options={{
              ...appHeaderOptions,
              title: t("navigation.routine"),
            }}
          />
          <Stack.Screen
            name="routine/complete/index"
            options={{
              ...appHeaderOptions,
              title: t("routineComplete.navTitle"),
            }}
          />
          <Stack.Screen
            name="exercises/index"
            options={{
              ...appHeaderOptions,
              title: t("navigation.exercises"),
            }}
          />
          <Stack.Screen
            name="exercises/stepTracker/index"
            options={{
              ...appHeaderOptions,
              title: t("stepTracker.title"),
            }}
          />
          <Stack.Screen
            name="exercises/[exerciseId]"
            options={
              isWeb
                ? { headerShown: false }
                : {
                    headerShown: true,
                    headerRight: renderDrawerToggle,
                    title: t("navigation.exercises"),
                  }
            }
          />
          <Stack.Screen
            name="exercises/detail/[exerciseId]"
            options={
              isWeb
                ? {
                    headerShown: true,
                    header: () => <TAppHeader drawerState={drawerState} />,
                  }
                : {
                    headerShown: true,
                    headerRight: renderDrawerToggle,
                    title: t("exercises.detail.subtitle"),
                  }
            }
          />
          <Stack.Screen
            name="exerciseSession/index"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="sessions/index"
            options={{
              ...appHeaderOptions,
              title: t("sessions.title"),
            }}
          />
          <Stack.Screen
            name="settings/index"
            options={{
              ...appHeaderOptions,
              title: t("settings.title"),
            }}
          />
          <Stack.Screen
            name="aiCoach/index"
            options={{
              ...appHeaderOptions,
              title: t("navigation.aiCoach"),
            }}
          />
          <Stack.Screen
            name="routineAnalysis/index"
            options={{
              ...appHeaderOptions,
              title: t("routineAnalysis.title"),
            }}
          />
          <Stack.Screen
            name="allStepTrackers/index"
            options={{
              ...appHeaderOptions,
              title: t("sessions.stepTracker.allTitle"),
            }}
          />
          <Stack.Screen
            name="allRoutines/index"
            options={{
              ...appHeaderOptions,
              title: t("sessions.routineList.allTitle"),
            }}
          />
        </Stack>
        <TDrawer isOpen={drawerState.isOpen} onClose={drawerState.close} />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </TamaguiProvider>
  );
}
