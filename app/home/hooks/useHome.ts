import { useRouter } from "expo-router";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import type { HomeNavAction } from "../home.types";

export const useHome = () => {
  const { t } = useTranslation();
  const router = useRouter();

  // Static action definitions
  const actions: HomeNavAction[] = useMemo(
    () => [
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
    ],
    [],
  );

  // Header content
  const headerTitle = t("home.title");
  const headerSubtitle = t("home.subtitle");
  const headerDescription = t("home.description");

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
    headerDescription,
    actionCards,
  };
};
