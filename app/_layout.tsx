import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";
import "react-native-reanimated";

import AppLoader from "@/components/AppLoader";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useColorScheme } from "@/hooks/useColorScheme";
import "@/locales/i18n";
import { usePreferencesStore } from "@/stores/preferencesStore";

export default function RootLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const hasHydrated = usePreferencesStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );

  // Initialize language preference on app startup
  useAppLanguage();

  // Show loader while preferences are being loaded
  if (!hasHydrated) {
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
      </Stack>
      <StatusBar style={colorScheme === "dark" ? "light" : "dark"} />
    </ThemeProvider>
  );
}
