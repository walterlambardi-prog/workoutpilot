import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, H5, Text, XStack, YStack, useTheme } from "tamagui";

import type { StreakInfo } from "@/app/home/hooks/useHomeStats";

interface TStreakCardProps {
  streakInfo: StreakInfo;
}

export const TStreakCard: React.FC<TStreakCardProps> = ({ streakInfo }) => {
  const { t } = useTranslation();
  const theme = useTheme();

  // Generate last 14 days for calendar
  const last14Days = useMemo(() => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 13; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push({
        timestamp: date.getTime(),
        isActive: streakInfo.activeDays.includes(date.getTime()),
        dayLabel: date.getDate(),
      });
    }

    return days;
  }, [streakInfo.activeDays]);

  const streakMessage = useMemo(() => {
    if (streakInfo.currentStreak === 0) {
      return t("home.streak.startToday");
    }
    if (streakInfo.currentStreak === 1) {
      return t("home.streak.keepGoing");
    }
    if (streakInfo.currentStreak < 7) {
      return t("home.streak.onFire");
    }
    return t("home.streak.incredible");
  }, [streakInfo.currentStreak, t]);

  return (
    <Card
      size="$4"
      bordered
      backgroundColor="$background"
      borderColor="$borderColor"
      padding="$4"
    >
      <YStack gap="$3">
        <XStack justifyContent="space-between" alignItems="center">
          <YStack gap="$1">
            <H5 color="$color" fontWeight="700">
              {t("home.streak.title")}
            </H5>
            <Text fontSize="$3" color="$color" opacity={0.8}>
              {streakMessage}
            </Text>
          </YStack>

          <XStack gap="$2" alignItems="baseline">
            <Text
              fontSize="$8"
              fontWeight="700"
              color={theme.warning?.get() as any}
            >
              {streakInfo.currentStreak}
            </Text>
            <Text fontSize="$4" fontWeight="600" color="$color" opacity={0.8}>
              {t("home.streak.days")}
            </Text>
          </XStack>
        </XStack>

        {/* Mini calendar */}
        <XStack gap="$2" flexWrap="wrap" justifyContent="center">
          {last14Days.map((day) => (
            <YStack
              key={day.timestamp}
              width={32}
              height={32}
              alignItems="center"
              justifyContent="center"
              borderRadius="$2"
              backgroundColor={
                (day.isActive
                  ? theme.streakActive?.get()
                  : theme.streakInactiveBg?.get()) as any
              }
            >
              <Text
                fontSize="$3"
                color={
                  (day.isActive
                    ? theme.streakActiveText?.get()
                    : theme.streakInactiveText?.get()) as any
                }
                fontWeight={day.isActive ? "700" : "500"}
              >
                {day.dayLabel}
              </Text>
            </YStack>
          ))}
        </XStack>

        {streakInfo.longestStreak > streakInfo.currentStreak && (
          <Text fontSize="$3" color="$color" opacity={0.7} textAlign="center">
            {t("home.streak.longestStreak", {
              count: streakInfo.longestStreak,
            })}
          </Text>
        )}
      </YStack>
    </Card>
  );
};
