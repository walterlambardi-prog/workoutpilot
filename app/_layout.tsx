import { Ionicons } from "@expo/vector-icons";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack, useRouter, useSegments } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable } from "react-native";
import "react-native-reanimated";
import { TamaguiProvider } from "tamagui";

import { TAppHeader } from "@/components/TAppHeader";
import { TDrawer } from "@/components/TDrawer";
import "@/config/initReactotron";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useSyncInitialization } from "@/hooks/useSyncInitialization";
import "@/locales/i18n";
import { initializeAuth, useAuthStore } from "@/stores/authStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import config from "../tamagui.config";
import { getDrawerButtonStyle } from "./navigation/navigation.styles";

// Keep the native splash screen visible until we're ready
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const segments = useSegments();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isWeb = Platform.OS === "web";
  const navigationTheme = colorScheme === "dark" ? DarkTheme : DefaultTheme;

  const preferencesHasHydrated = usePreferencesStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );
  const authHasHydrated = useAuthStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );
  const isAuthInitialized = useAuthStore(
    (state: { _isAuthInitialized: boolean }) => state._isAuthInitialized,
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
  const { isReady: isSyncReady } = useSyncInitialization();

  // ── Auth gate ──────────────────────────────────────────────────────
  // All prerequisites for routing decisions
  const isReady =
    preferencesHasHydrated && authHasHydrated && isAuthInitialized;

  // Determine where the user SHOULD be based on auth state
  const authTarget = useMemo<"login" | "onboarding" | "app" | null>(() => {
    if (!isReady) return null;
    if (!session) return "login";
    if (!hasCompletedOnboarding) return "onboarding";
    return "app";
  }, [isReady, session, hasCompletedOnboarding]);

  // Check if the current route already matches the auth target
  const currentSegment = segments[0];
  const isRouteAligned = useMemo(() => {
    if (!authTarget) return false;
    switch (authTarget) {
      case "login":
        return currentSegment === "login";
      case "onboarding":
        return currentSegment === "onboarding";
      case "app":
        return currentSegment !== "login" && currentSegment !== "onboarding";
    }
  }, [authTarget, currentSegment]);

  // Redirect to the correct route when misaligned
  useEffect(() => {
    if (!authTarget || isRouteAligned) return;

    switch (authTarget) {
      case "login":
        router.replace("/login");
        break;
      case "onboarding":
        router.replace("/onboarding");
        break;
      case "app":
        router.replace("/");
        break;
    }
  }, [authTarget, isRouteAligned, router]);

  // Show a full-screen loader when:
  //  1. Stores haven't hydrated / auth hasn't initialised yet
  //  2. Auth is ready but the current route doesn't match auth target yet
  //  3. Authenticated user is still loading initial data from Supabase
  const showOverlay = !isReady || !isRouteAligned;
  const showSyncLoader = !!session && !isSyncReady;
  const isLoading = showOverlay || showSyncLoader;

  // Hide the native splash screen once everything is ready.
  // The splash stays on top of the Stack, preventing any flash.
  useEffect(() => {
    if (!isLoading) {
      SplashScreen.hideAsync();
    }
  }, [isLoading]);

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
            name="routine/rest"
            options={{
              headerShown: false,
              gestureEnabled: false,
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
          <Stack.Screen
            name="tutorial/index"
            options={
              isWeb
                ? {
                    headerShown: true,
                    header: () => <TAppHeader drawerState={drawerState} />,
                  }
                : {
                    headerShown: true,
                    headerRight: renderDrawerToggle,
                    title: t("tutorial.title"),
                  }
            }
          />
          <Stack.Screen
            name="tutorial/poseDetection"
            options={
              isWeb
                ? {
                    headerShown: true,
                    header: () => <TAppHeader drawerState={drawerState} />,
                  }
                : {
                    headerShown: true,
                    headerRight: renderDrawerToggle,
                    title: t("tutorial.mediapipe.title"),
                  }
            }
          />
          <Stack.Screen
            name="tutorial/exercises"
            options={
              isWeb
                ? {
                    headerShown: true,
                    header: () => <TAppHeader drawerState={drawerState} />,
                  }
                : {
                    headerShown: true,
                    headerRight: renderDrawerToggle,
                    title: t("tutorial.exercises.title"),
                  }
            }
          />
        </Stack>
        <TDrawer isOpen={drawerState.isOpen} onClose={drawerState.close} />
        <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
      </ThemeProvider>
    </TamaguiProvider>
  );
}
