import React from "react";
import { useTranslation } from "react-i18next";
import { Card, H5, Text, XStack, YStack } from "tamagui";

import type { TodayStats } from "@/app/home/hooks/useHomeStats";

interface TTodayStatsCardProps {
  stats: TodayStats;
}

interface StatBoxProps {
  value: string | number;
  label: string;
  colorScheme: "blue" | "green" | "purple" | "orange";
}

const StatBox: React.FC<StatBoxProps> = ({ value, label, colorScheme }) => {
  const colorMap = {
    blue: { bg: "$blue3" as const, text: "$blue11" as const },
    green: { bg: "$green3" as const, text: "$green11" as const },
    purple: { bg: "$purple3" as const, text: "$purple11" as const },
    orange: { bg: "$orange3" as const, text: "$orange11" as const },
  };

  const colors = colorMap[colorScheme];

  return (
    <YStack
      flex={1}
      $sm={{ minWidth: "48%" }}
      $gtSm={{ minWidth: 100 }}
      gap="$1"
      alignItems="center"
      padding="$3"
      backgroundColor={colors.bg as any}
      borderRadius="$4"
    >
      <Text fontSize="$9" fontWeight="700" color={colors.text as any}>
        {value}
      </Text>
      <Text
        fontSize="$3"
        fontWeight="600"
        color={colors.text as any}
        textAlign="center"
      >
        {label}
      </Text>
    </YStack>
  );
};

export const TTodayStatsCard: React.FC<TTodayStatsCardProps> = ({ stats }) => {
  const { t } = useTranslation();

  return (
    <Card
      size="$4"
      bordered
      backgroundColor="$background"
      borderColor="$borderColor"
      padding="$4"
    >
      <YStack gap="$3">
        <H5 color="$color" fontWeight="700">
          {t("home.todayStats.title")}
        </H5>

        <XStack gap="$3" flexWrap="wrap">
          <StatBox
            value={stats.totalReps}
            label={t("home.todayStats.reps")}
            colorScheme="blue"
          />

          <StatBox
            value={stats.sessionsCompleted}
            label={t("home.todayStats.sessions")}
            colorScheme="green"
          />

          <StatBox
            value={stats.totalMinutes}
            label={t("home.todayStats.minutes")}
            colorScheme="purple"
          />

          {stats.stepsWalked > 0 && (
            <StatBox
              value={stats.stepsWalked.toLocaleString()}
              label={t("home.todayStats.steps")}
              colorScheme="orange"
            />
          )}
        </XStack>
      </YStack>
    </Card>
  );
};
