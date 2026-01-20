import { Link } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { HelloWave } from "@/components/helloWave";
import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "./home.styles";
import type { HomeNavAction } from "./home.types";

const actions: HomeNavAction[] = [
  {
    href: "/exercises",
    key: "exercises",
  },
  {
    href: "/sessions",
    key: "sessions",
  },
  {
    href: "/settings",
    key: "settings",
  },
];

/**
 * Home screen for WorkoutPilot
 * Acts as an entry point to Exercises
 */
const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();

  return (
    <ThemedView style={[styles.page, { paddingTop: 30 + insets.top }]}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t("home.title")}</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.heroContainer}>
        <ThemedText type="subtitle">{t("home.subtitle")}</ThemedText>
        <ThemedText>{t("home.description")}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        {actions.map((action) => (
          <Link key={action.key} href={action.href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed ? styles.actionCardPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t(`home.actions.${action.key}.title`)}
              accessibilityHint={t(
                `home.actions.${action.key}.accessibilityHint`,
              )}
            >
              <ThemedText type="subtitle">
                {t(`home.actions.${action.key}.title`)}
              </ThemedText>
              <ThemedText>
                {t(`home.actions.${action.key}.description`)}
              </ThemedText>
            </Pressable>
          </Link>
        ))}
      </ThemedView>
    </ThemedView>
  );
};

export default HomeScreen;
