import React from "react";
import { useTranslation } from "react-i18next";
import type { ColorValue } from "react-native";
import { Card, H5, Text, XStack, YStack } from "tamagui";

import type { Achievement } from "@/app/home/hooks/useHomeStats";
import { useColorScheme } from "@/hooks/useColorScheme";

interface TAchievementCardProps {
  achievement: Achievement;
}

export const TAchievementCard: React.FC<TAchievementCardProps> = ({
  achievement,
}) => {
  const { t } = useTranslation();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const getTheme = (): {
    bg: ColorValue;
    border: ColorValue;
    accentColor: ColorValue;
  } => {
    switch (achievement.type) {
      case "record":
        return {
          bg: isDark ? "#78350f" : "#fef3c7",
          border: isDark ? "#d97706" : "#fcd34d",
          accentColor: isDark ? "#fcd34d" : "#d97706",
        };
      case "streak":
        return {
          bg: isDark ? "#9a3412" : "#fed7aa",
          border: isDark ? "#ea580c" : "#fb923c",
          accentColor: isDark ? "#fdba74" : "#ea580c",
        };
      case "milestone":
        return {
          bg: isDark ? "#581c87" : "#e9d5ff",
          border: isDark ? "#9333ea" : "#c084fc",
          accentColor: isDark ? "#c084fc" : "#9333ea",
        };
      default:
        return {
          bg: isDark ? "#1e3a8a" : "#dbeafe",
          border: isDark ? "#2563eb" : "#93c5fd",
          accentColor: isDark ? "#93c5fd" : "#2563eb",
        };
    }
  };

  const { bg, border, accentColor } = getTheme();

  return (
    <Card
      size="$4"
      bordered
      backgroundColor={bg as any}
      borderColor={border as any}
      padding="$4"
      animation="quick"
      enterStyle={{ opacity: 0, scale: 0.9 }}
      exitStyle={{ opacity: 0, scale: 0.9 }}
    >
      <XStack gap="$3" alignItems="center">
        <YStack
          width={56}
          height={56}
          alignItems="center"
          justifyContent="center"
          backgroundColor="$background"
          borderRadius="$6"
          borderWidth={2}
          borderColor="$borderColor"
        >
          <Text fontSize="$9">{achievement.icon}</Text>
        </YStack>

        <YStack flex={1} gap="$1">
          <Text fontSize="$3" color={accentColor as any} fontWeight="700">
            {t("home.achievement.label")}
          </Text>
          <H5 color="$color" fontWeight="700">
            {achievement.title}
          </H5>
          <Text fontSize="$4" color="$color" opacity={0.8}>
            {achievement.description}
          </Text>
        </YStack>
      </XStack>
    </Card>
  );
};
