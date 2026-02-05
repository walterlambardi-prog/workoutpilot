import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "tamagui";

import type { HomeNavAction } from "../home.types";

export const useHome = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();

  // Static action definitions
  const actions: HomeNavAction[] = useMemo(
    () => [
      {
        href: "/aiCoach",
        key: "aiCoach",
        icon: "chatbubble-ellipses-outline" as const,
        color: theme.iconCyan?.get() ?? "#22D3EE",
      },
      {
        href: "/routine",
        key: "routine",
        icon: "repeat-outline" as const,
        color: theme.iconRed?.get() ?? "#F87171",
      },
      {
        href: "/exercises",
        key: "exercises",
        icon: "barbell-outline" as const,
        color: theme.iconBlue?.get() ?? "#60A5FA",
      },
      {
        href: "/sessions",
        key: "sessions",
        icon: "stats-chart-outline" as const,
        color: theme.iconGreen?.get() ?? "#34D399",
      },
      {
        href: "/settings",
        key: "settings",
        icon: "settings-outline" as const,
        color: theme.iconPurple?.get() ?? "#A78BFA",
      },
    ],
    [theme],
  );

  // Header content
  const headerTitle = t("home.title");
  const headerSubtitle = t("home.subtitle");

  // Action cards with translated content and pre-bound handlers
  const actionCards = useMemo(
    () =>
      actions.map((action) => ({
        ...action,
        title: t(`home.actions.${action.key}.title`),
        description: t(`home.actions.${action.key}.description`),
        accessibilityHint: t(`home.actions.${action.key}.accessibilityHint`),
        onPress: () => router.push(action.href),
      })),
    [actions, router, t],
  );

  return {
    headerTitle,
    headerSubtitle,
    actionCards,
  };
};
