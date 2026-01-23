import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import "react-native-reanimated";

import AppLoader from "@/components/AppLoader";
import "@/config/initReactotron";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useColorScheme } from "@/hooks/useColorScheme";
import "@/locales/i18n";
import { usePreferencesStore } from "@/stores/preferencesStore";

export default function RootLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const [isReady, setIsReady] = useState(false);
  const hasHydrated = usePreferencesStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );

  // Initialize language preference on app startup
  useAppLanguage();

  // Timeout fallback: if hydration doesn't complete in 2 seconds, show the app anyway
  useEffect(() => {
    if (hasHydrated) {
      setIsReady(true);
      return;
    }

    const timeout = setTimeout(() => {
      console.warn("[RootLayout] Hydration timeout, proceeding anyway");
      setIsReady(true);
    }, 2000);

    return () => clearTimeout(timeout);
  }, [hasHydrated]);

  // Show loader while preferences are being loaded
  if (!isReady) {
    return <AppLoader colorScheme={colorScheme} />;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: Platform.OS === "web" ? false : undefined,
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen
          name="routine/index"
          options={{ title: t("navigation.routine") }}
        />
        <Stack.Screen
          name="routine/complete/index"
          options={{ title: t("routineComplete.navTitle") }}
        />
        <Stack.Screen
          name="exercises/index"
          options={{ title: t("navigation.exercises") }}
        />
        <Stack.Screen
          name="exercises/[exerciseId]"
          options={{ title: t("navigation.exercises") }}
        />
        <Stack.Screen
          name="sessions/index"
          options={{ title: t("navigation.sessions") }}
        />
        <Stack.Screen
          name="settings/index"
          options={{ title: t("navigation.settings") }}
        />
        <Stack.Screen
          name="aiCoach/index"
          options={{ title: t("navigation.aiCoach") }}
        />
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
