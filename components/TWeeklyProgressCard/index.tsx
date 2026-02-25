import { Ionicons } from "@expo/vector-icons";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Card, H5, Separator, Text, XStack, YStack, useTheme } from "tamagui";

import type {
    CategoryBreakdown,
    CategoryColorScheme,
    DailyActivity,
    PersonalRecord,
    TWeeklyProgressCardProps,
} from "./TWeeklyProgressCard.types";

// ─── Color helpers ───────────────────────────────────────────────────────────

const COLOR_MAP: Record<
  CategoryColorScheme,
  {
    bg: "$blue3" | "$green3" | "$purple3" | "$orange3";
    fg: "$blue11" | "$green11" | "$purple11" | "$orange11";
  }
> = {
  blue: { bg: "$blue3", fg: "$blue11" },
  green: { bg: "$green3", fg: "$green11" },
  purple: { bg: "$purple3", fg: "$purple11" },
  orange: { bg: "$orange3", fg: "$orange11" },
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Single bar in the weekly chart */
const DayBar: React.FC<{
  day: DailyActivity;
  label: string;
  accentColor: string;
}> = ({ day, label, accentColor }) => {
  const theme = useTheme();

  const barBg = day.isToday
    ? accentColor
    : day.isFuture || day.barHeight === 0
      ? (theme.borderColor?.get() as string)
      : (theme.blue11?.get() as string);

  const barOpacity = day.isFuture ? 0.3 : day.barHeight === 0 ? 0.2 : 0.85;

  return (
    <YStack flex={1} alignItems="center" gap="$1">
      {/* Bar container – fixed height, bars grow from bottom */}
      <YStack height={100} justifyContent="flex-end" width="100%">
        <YStack
          width="100%"
          height={day.barHeight || 4}
          backgroundColor={barBg as any}
          opacity={barOpacity}
          borderRadius="$2"
          maxWidth={28}
          alignSelf="center"
        />
      </YStack>
      {/* Day label */}
      <Text
        fontSize="$1"
        fontWeight={day.isToday ? "700" : "400"}
        color={day.isToday ? "$color" : "$placeholderColor"}
        textAlign="center"
      >
        {label}
      </Text>
    </YStack>
  );
};

/** Horizontal progress bar for a training category */
const CategoryBar: React.FC<{
  item: CategoryBreakdown;
  label: string;
}> = ({ item, label }) => {
  const colors = COLOR_MAP[item.colorScheme];

  return (
    <XStack gap="$3" alignItems="center">
      <Text
        fontSize="$3"
        fontWeight="600"
        color="$color"
        width={60}
        numberOfLines={1}
      >
        {label}
      </Text>
      <YStack
        flex={1}
        height={8}
        backgroundColor={colors.bg as any}
        borderRadius="$1"
      >
        <YStack
          height="100%"
          width={`${Math.max(item.percentage, 3)}%` as any}
          backgroundColor={colors.fg as any}
          borderRadius="$1"
        />
      </YStack>
      <Text
        fontSize="$2"
        fontWeight="600"
        color="$placeholderColor"
        width={36}
        textAlign="right"
      >
        {item.percentage}%
      </Text>
    </XStack>
  );
};

/** Single personal record row */
const RecordRow: React.FC<{
  record: PersonalRecord;
}> = ({ record }) => {
  const colors = COLOR_MAP[record.colorScheme];

  return (
    <XStack gap="$3" alignItems="center">
      <YStack
        width="$3"
        height="$3"
        alignItems="center"
        justifyContent="center"
        backgroundColor={colors.bg as any}
        borderRadius="$2"
      >
        <Ionicons
          name={record.icon as any}
          size={16}
          color={colors.fg as any}
        />
      </YStack>
      <YStack flex={1}>
        <Text fontSize="$2" fontWeight="600" color="$placeholderColor">
          {record.label}
        </Text>
        <Text fontSize="$3" fontWeight="700" color="$color" numberOfLines={1}>
          {record.value}
        </Text>
      </YStack>
    </XStack>
  );
};

// ─── Main component ──────────────────────────────────────────────────────────

/**
 * Premium weekly progress dashboard card.
 *
 * Sections:
 *  1. Title + week-over-week trend badge
 *  2. Daily activity bar chart (Mon–Sun)
 *  3. This-week summary metrics
 *  4. Training Focus – category progress bars
 *  5. Personal Records
 */
export const TWeeklyProgressCard: React.FC<TWeeklyProgressCardProps> = ({
  data,
}) => {
  const { t } = useTranslation();
  const theme = useTheme();

  const accentColor = (theme.primary?.get() ?? theme.blue11?.get()) as string;
  const successColor = theme.success?.get() as string;
  const errorColor = theme.error?.get() as string;

  // Trend display
  const trend = useMemo(() => {
    if (data.trendPercentage > 0) {
      return {
        icon: "trending-up-outline" as const,
        label: t("home.weeklyProgress.trendUp", {
          percent: data.trendPercentage,
        }),
        color: successColor,
      };
    }
    if (data.trendPercentage < 0) {
      return {
        icon: "trending-down-outline" as const,
        label: t("home.weeklyProgress.trendDown", {
          percent: Math.abs(data.trendPercentage),
        }),
        color: errorColor,
      };
    }
    return null;
  }, [data.trendPercentage, successColor, errorColor, t]);

  // If no data at all, don't render
  if (!data.hasData) return null;

  return (
    <Card
      size="$4"
      bordered
      backgroundColor="$background"
      borderColor="$borderColor"
      padding="$4"
    >
      <YStack gap="$4">
        {/* ── Section 1: Title + Trend ── */}
        <XStack justifyContent="space-between" alignItems="center">
          <H5 color="$color" fontWeight="700">
            {t("home.weeklyProgress.title")}
          </H5>

          {trend && data.hasWeekData && (
            <XStack
              gap="$1"
              alignItems="center"
              backgroundColor={`${trend.color}18` as any}
              paddingHorizontal="$2"
              paddingVertical="$1"
              borderRadius="$3"
            >
              <Ionicons
                name={trend.icon as any}
                size={14}
                color={trend.color}
              />
              <Text fontSize="$2" fontWeight="700" color={trend.color as any}>
                {trend.label}
              </Text>
            </XStack>
          )}
        </XStack>

        {/* ── Section 2: Bar Chart ── */}
        {data.hasWeekData ? (
          <XStack gap="$1" paddingHorizontal="$1">
            {data.dailyActivity.map((day) => (
              <DayBar
                key={day.dayKey}
                day={day}
                label={t(`home.weeklyProgress.days.${day.dayKey}`)}
                accentColor={accentColor}
              />
            ))}
          </XStack>
        ) : (
          <YStack
            height={100}
            alignItems="center"
            justifyContent="center"
            gap="$2"
          >
            <Ionicons
              name="bar-chart-outline"
              size={32}
              color={theme.placeholderColor?.get() as string}
            />
            <Text fontSize="$3" color="$placeholderColor" textAlign="center">
              {t("home.weeklyProgress.emptyWeek")}
            </Text>
          </YStack>
        )}

        {/* ── Section 3: Week Summary ── */}
        {data.hasWeekData && (
          <XStack
            gap="$3"
            justifyContent="center"
            flexWrap="wrap"
            paddingVertical="$1"
          >
            <XStack gap="$1" alignItems="baseline">
              <Text fontSize="$5" fontWeight="700" color="$color">
                {data.currentWeek.totalReps}
              </Text>
              <Text fontSize="$2" color="$placeholderColor">
                {t("home.weeklyProgress.reps")}
              </Text>
            </XStack>

            <Text fontSize="$3" color="$placeholderColor" alignSelf="center">
              ·
            </Text>

            <XStack gap="$1" alignItems="baseline">
              <Text fontSize="$5" fontWeight="700" color="$color">
                {data.currentWeek.totalMinutes}
              </Text>
              <Text fontSize="$2" color="$placeholderColor">
                {t("home.weeklyProgress.minutes")}
              </Text>
            </XStack>

            <Text fontSize="$3" color="$placeholderColor" alignSelf="center">
              ·
            </Text>

            <XStack gap="$1" alignItems="baseline">
              <Text fontSize="$5" fontWeight="700" color="$color">
                {data.currentWeek.totalSessions}
              </Text>
              <Text fontSize="$2" color="$placeholderColor">
                {t("home.weeklyProgress.sessions")}
              </Text>
            </XStack>
          </XStack>
        )}

        {/* ── Section 4: Training Focus ── */}
        {data.categoryBreakdown.length > 0 && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$3">
              <Text fontSize="$3" fontWeight="700" color="$color" opacity={0.8}>
                {t("home.weeklyProgress.trainingFocus")}
              </Text>
              {data.categoryBreakdown.map((cat) => (
                <CategoryBar
                  key={cat.category}
                  item={cat}
                  label={t(cat.translationKey)}
                />
              ))}
            </YStack>
          </>
        )}

        {/* ── Section 5: Personal Records ── */}
        {data.personalRecords.length > 0 && (
          <>
            <Separator borderColor="$borderColor" />
            <YStack gap="$3">
              <Text fontSize="$3" fontWeight="700" color="$color" opacity={0.8}>
                {t("home.weeklyProgress.personalRecords")}
              </Text>
              {data.personalRecords.map((rec) => (
                <RecordRow key={rec.type} record={rec} />
              ))}
            </YStack>
          </>
        )}
      </YStack>
    </Card>
  );
};

export default TWeeklyProgressCard;
