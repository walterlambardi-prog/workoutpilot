import { useRouter } from "expo-router";
import React, { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { YStack } from "tamagui";

import { TActionCard } from "@/components/TActionCard";
import { TPage } from "@/components/TPage";
import { TWelcomeHeader } from "@/components/TWelcomeHeader";
import type { HomeNavAction } from "./home.types";

const actions: HomeNavAction[] = [
  {
    href: "/aiCoach",
    key: "aiCoach",
    icon: "chatbubble-ellipses-outline" as const,
    color: "#22D3EE",
  },
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
 * Acts as an entry point to all main features
 * Built with Tamagui for modern, responsive UI
 */
const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();

  const handleActionPress = useCallback(
    (href: HomeNavAction["href"]) => {
      router.push(href);
    },
    [router],
  );

  return (
    <TPage backgroundColor="$background" hasHeader>
      {/* Welcome Header */}
      <TWelcomeHeader
        title={t("home.title")}
        subtitle={t("home.subtitle")}
        description={t("home.description")}
        showWave
      />

      {/* Action Cards Grid */}
      <YStack space="$4">
        {actions.map((action) => (
          <TActionCard
            key={action.key}
            title={t(`home.actions.${action.key}.title`)}
            description={t(`home.actions.${action.key}.description`)}
            icon={action.icon}
            iconColor={action.color}
            accessibilityHint={t(
              `home.actions.${action.key}.accessibilityHint`,
            )}
            onPress={() => handleActionPress(action.href)}
          />
        ))}
      </YStack>
    </TPage>
  );
};

export default HomeScreen;
