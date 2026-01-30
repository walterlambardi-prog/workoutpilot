import React from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { TCard } from "@/components/TCard";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";

import styles, { DEFAULT_WEEKS } from "./ActivityHeatmap.styles";
import type { ActivityHeatmapProps } from "./ActivityHeatmap.types";
import { useActivityHeatmap } from "./hooks/useActivityHeatmap";

const formatDurationLabel = (
  durationMs: number,
  t: (key: string, options?: Record<string, unknown>) => string,
) => {
  if (durationMs <= 0) return t("activityHeatmap.summary.durationEmpty");

  const totalMinutes = Math.floor(durationMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return t("activityHeatmap.summary.durationWithDays", {
      days,
      hours,
      minutes,
    });
  }

  return t("activityHeatmap.summary.durationSubDay", {
    hours,
    minutes,
  });
};

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = () => {
  const { t } = useTranslation();
  const {
    heatmap,
    legendValues,
    hasActivity,
    colorForValue,
    colors,
    squareSize: cellSize,
    gap: cellGap,
    totals,
  } = useActivityHeatmap();
  const { backgroundColor, borderColor } = colors;
  const weeks = DEFAULT_WEEKS;
  const durationLabel = formatDurationLabel(totals.durationMs, t);

  return (
    <TCard gap="$4">
      <TStack gap="$1">
        <THeading level={4}>{t("activityHeatmap.title")}</THeading>
        <TText variant="body" color="$placeholderColor">
          {t("activityHeatmap.subtitle", { weeks })}
        </TText>
      </TStack>

      <TRow gap="$2" flexWrap="wrap">
        <View style={[styles.pill, { backgroundColor, borderColor }]}>
          <TText variant="body">
            {t("activityHeatmap.summary.sessions", {
              count: heatmap.totalSessions,
            })}
          </TText>
        </View>
        <View style={[styles.pill, { backgroundColor, borderColor }]}>
          <TText variant="body">
            {t("activityHeatmap.summary.routines", {
              count: heatmap.totalRoutines,
            })}
          </TText>
        </View>
        <View style={[styles.pill, { backgroundColor, borderColor }]}>
          <TText variant="body">
            {t("activityHeatmap.summary.totalReps", { count: totals.reps })}
          </TText>
        </View>
        <View style={[styles.pill, { backgroundColor, borderColor }]}>
          <TText variant="body">{durationLabel}</TText>
        </View>
      </TRow>

      {hasActivity ? (
        <View style={styles.svgWrapper}>
          <Svg
            width="100%"
            height={heatmap.height}
            viewBox={`0 0 ${heatmap.width} ${heatmap.height}`}
            preserveAspectRatio="xMinYMin meet"
          >
            {heatmap.cells.map((cell) => {
              const { fill, opacity } = colorForValue(cell.value);
              const x = cell.weekIndex * (cellSize + cellGap);
              const y = cell.dayIndex * (cellSize + cellGap);
              return (
                <Rect
                  key={`${cell.key}-${cell.weekIndex}`}
                  x={x}
                  y={y}
                  width={cellSize}
                  height={cellSize}
                  rx={4}
                  ry={4}
                  fill={fill}
                  fillOpacity={opacity}
                  stroke={borderColor}
                  strokeWidth={0.5}
                />
              );
            })}
          </Svg>
        </View>
      ) : (
        <TText variant="caption" color="$placeholderColor">
          {t("activityHeatmap.empty")}
        </TText>
      )}

      <TRow
        gap="$2"
        alignItems="center"
        justifyContent="space-between"
        flexWrap="wrap"
      >
        <TRow gap="$2" alignItems="center">
          <TText variant="caption" color="$placeholderColor">
            {t("activityHeatmap.legend.low")}
          </TText>
          {legendValues.map((value, index) => {
            const { fill, opacity } = colorForValue(value);
            return (
              <View
                key={`${value}-${index}`}
                style={[
                  styles.legendSwatch,
                  { backgroundColor: fill, borderColor, opacity },
                ]}
              />
            );
          })}
          <TText variant="caption" color="$placeholderColor">
            {t("activityHeatmap.legend.high")}
          </TText>
        </TRow>
      </TRow>
    </TCard>
  );
};

export default ActivityHeatmap;
