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

import { useColorScheme } from "@/hooks/useColorScheme";
import "@/locales/i18n";

export default function RootLayout() {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();

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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
