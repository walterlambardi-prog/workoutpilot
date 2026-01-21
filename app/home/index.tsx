import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActionCard from "@/components/ActionCard";
import { HelloWave } from "@/components/helloWave";
import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import styles from "./home.styles";
import type { HomeNavAction } from "./home.types";

const actions: HomeNavAction[] = [
  {
    href: "/routine",
    key: "routine",
    icon: "repeat-outline" as const,
    color: "#F87171",
  },
  {
    href: "/exercises",
    key: "exercises",
    icon: "barbell-outline" as const,
    color: "#60A5FA",
  },
  {
    href: "/sessions",
    key: "sessions",
    icon: "stats-chart-outline" as const,
    color: "#34D399",
  },
  {
    href: "/settings",
    key: "settings",
    icon: "settings-outline" as const,
    color: "#A78BFA",
  },
];

/**
 * Home screen for WorkoutPilot
 * Acts as an entry point to Exercises
 */
const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const handleActionPress = useCallback(
    (href: HomeNavAction["href"]) => {
      router.push(href);
    },
    [router],
  );

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
          <ActionCard
            key={action.key}
            title={t(`home.actions.${action.key}.title`)}
            subtitle={t(`home.actions.${action.key}.description`)}
            icon={action.icon}
            iconColor={action.color}
            accessibilityHint={t(
              `home.actions.${action.key}.accessibilityHint`,
            )}
            onPress={() => handleActionPress(action.href)}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
};

export default HomeScreen;
