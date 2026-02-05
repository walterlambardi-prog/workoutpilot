import React from "react";
import { useTranslation } from "react-i18next";
import type { ColorValue } from "react-native";
import { Card, H5, Text, XStack, YStack } from "tamagui";

import type { TodayStats } from "@/app/home/hooks/useHomeStats";
import { useColorScheme } from "@/hooks/useColorScheme";

interface TTodayStatsCardProps {
  stats: TodayStats;
}

export const TTodayStatsCard: React.FC<TTodayStatsCardProps> = ({ stats }) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  // Colors that adapt to theme
  const blueBox = {
    bg: (isDark ? "#1e3a8a" : "#dbeafe") as ColorValue,
    text: (isDark ? "#93c5fd" : "#2563eb") as ColorValue,
  };
  const greenBox = {
    bg: (isDark ? "#065f46" : "#d1fae5") as ColorValue,
    text: (isDark ? "#6ee7b7" : "#059669") as ColorValue,
  };
  const purpleBox = {
    bg: (isDark ? "#581c87" : "#e9d5ff") as ColorValue,
    text: (isDark ? "#c084fc" : "#9333ea") as ColorValue,
  };
  const orangeBox = {
    bg: (isDark ? "#9a3412" : "#fed7aa") as ColorValue,
    text: (isDark ? "#fdba74" : "#ea580c") as ColorValue,
  };

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
          <YStack
            flex={1}
            minWidth={80}
            gap="$1"
            alignItems="center"
            padding="$3"
            backgroundColor={blueBox.bg as any}
            borderRadius="$4"
          >
            <Text fontSize="$9" fontWeight="700" color={blueBox.text as any}>
              {stats.totalReps}
            </Text>
            <Text
              fontSize="$3"
              fontWeight="600"
              color={blueBox.text as any}
              textAlign="center"
            >
              {t("home.todayStats.reps")}
            </Text>
          </YStack>

          <YStack
            flex={1}
            minWidth={80}
            gap="$1"
            alignItems="center"
            padding="$3"
            backgroundColor={greenBox.bg as any}
            borderRadius="$4"
          >
            <Text fontSize="$9" fontWeight="700" color={greenBox.text as any}>
              {stats.sessionsCompleted}
            </Text>
            <Text
              fontSize="$3"
              fontWeight="600"
              color={greenBox.text as any}
              textAlign="center"
            >
              {t("home.todayStats.sessions")}
            </Text>
          </YStack>

          <YStack
            flex={1}
            minWidth={80}
            gap="$1"
            alignItems="center"
            padding="$3"
            backgroundColor={purpleBox.bg as any}
            borderRadius="$4"
          >
            <Text fontSize="$9" fontWeight="700" color={purpleBox.text as any}>
              {stats.totalMinutes}
            </Text>
            <Text
              fontSize="$3"
              fontWeight="600"
              color={purpleBox.text as any}
              textAlign="center"
            >
              {t("home.todayStats.minutes")}
            </Text>
          </YStack>

          {stats.stepsWalked > 0 && (
            <YStack
              flex={1}
              minWidth={80}
              gap="$1"
              alignItems="center"
              padding="$3"
              backgroundColor={orangeBox.bg as any}
              borderRadius="$4"
            >
              <Text
                fontSize="$9"
                fontWeight="700"
                color={orangeBox.text as any}
              >
                {stats.stepsWalked.toLocaleString()}
              </Text>
              <Text
                fontSize="$3"
                fontWeight="600"
                color={orangeBox.text as any}
                textAlign="center"
              >
                {t("home.todayStats.steps")}
              </Text>
            </YStack>
          )}
        </XStack>
      </YStack>
    </Card>
  );
};
