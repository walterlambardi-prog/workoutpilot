import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet } from "react-native";

import ActivityHeatmap from "@/components/ActivityHeatmap";
import MapView from "@/components/MapView";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";

import {
  formatDate,
  formatDuration,
  formatNumber,
  useSessions,
} from "./hooks/useSessions";

const StatTile: React.FC<{
  label: string;
  value: string;
  helper?: string;
}> = ({ label, value, helper }) => (
  <TCard gap="$2">
    <TText variant="label" color="$placeholderColor">
      {label}
    </TText>
    <THeading level={3}>{value}</THeading>
    {helper ? (
      <TText variant="caption" color="$placeholderColor">
        {helper}
      </TText>
    ) : null}
  </TCard>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <TText variant="caption" color="$placeholderColor">
    {text}
  </TText>
);

const SessionsScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    stepTrackerTotals,
    stepTrackerHistory,
    routineList,
    statHighlights,
    formatDistance,
    handleStartRoutine,
    handleEditRoutine,
    handleAnalyzeRoutine,
    handleViewRoutineSummary,
  } = useSessions();

  return (
    <TPage backgroundColor="$background" hasHeader gap="$4">
      <ScreenHeader
        title={t("sessions.title")}
        subtitle={t("sessions.subtitle")}
      />

      <ActivityHeatmap />

      <TGrid columns={3} gap="$3">
        {statHighlights.map((item) => (
          <StatTile
            key={item.key}
            label={item.label}
            value={item.value}
            helper={item.helper}
          />
        ))}
      </TGrid>

      <TCard gap="$3">
        <THeading level={3}>{t("sessions.stepTracker.title")}</THeading>

        <TGrid columns={Platform.OS === "web" ? 3 : 1} gap="$3">
          {stepTrackerTotals.totalSteps > 0 && (
            <StatTile
              label={t("sessions.stepTracker.totalSteps")}
              value={formatNumber(stepTrackerTotals.totalSteps)}
            />
          )}
          <StatTile
            label={t("sessions.stepTracker.totalDistance")}
            value={formatDistance(stepTrackerTotals.totalDistanceKm)}
          />
          <StatTile
            label={t("sessions.stepTracker.totalTime")}
            value={formatDuration(stepTrackerTotals.totalDurationMs)}
          />
        </TGrid>

        {stepTrackerHistory.length === 0 ? (
          <EmptyState text={t("sessions.stepTracker.empty")} />
        ) : (
          <TGrid columns={Platform.OS === "web" ? 3 : 1} gap="$3">
            {stepTrackerHistory.map((entry) => (
              <TStack
                key={entry.id}
                gap="$2"
                borderRadius="$6"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$backgroundHover"
                padding="$3"
              >
                <TRow justifyContent="space-between" alignItems="flex-start">
                  <TStack gap="$1">
                    <TText variant="label" color="$placeholderColor">
                      {t("stepTracker.stats.date")}
                    </TText>
                    <THeading level={4}>
                      {formatDate(entry.endedAt ?? entry.startedAt)}
                    </THeading>
                  </TStack>
                  <TStack alignItems="flex-end" gap="$1">
                    <TText variant="label" color="$placeholderColor">
                      {t("stepTracker.stats.duration")}
                    </TText>
                    <THeading level={4}>
                      {formatDuration(entry.durationMs)}
                    </THeading>
                  </TStack>
                </TRow>

                <TRow justifyContent="space-between" alignItems="flex-start">
                  <TStack gap="$1">
                    <TText variant="label" color="$placeholderColor">
                      {t("stepTracker.stats.distance")}
                    </TText>
                    <THeading level={4}>
                      {formatDistance(entry.distanceKm)}
                    </THeading>
                  </TStack>
                  <TStack alignItems="flex-end" gap="$1">
                    <TText variant="label" color="$placeholderColor">
                      {t("stepTracker.stats.steps")}
                    </TText>
                    <THeading level={4}>
                      {entry.steps > 0 ? formatNumber(entry.steps) : "-"}
                    </THeading>
                  </TStack>
                </TRow>

                <TStack borderRadius="$6" overflow="hidden">
                  <MapView
                    positions={entry.positions}
                    style={styles.stepTrackerMap}
                  />
                </TStack>
              </TStack>
            ))}
          </TGrid>
        )}
      </TCard>

      <TCard gap="$3">
        <THeading level={3}>{t("sessions.routineList.title")}</THeading>
        {routineList.length === 0 ? (
          <EmptyState text={t("sessions.routineList.empty")} />
        ) : (
          <TGrid columns={Platform.OS === "web" ? 3 : 1} gap="$4">
            {routineList.map((routine) => (
              <TStack
                key={routine.id}
                borderRadius="$6"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$backgroundHover"
                overflow="hidden"
              >
                {/* Header con stats principales */}
                <TStack padding="$4" gap="$3">
                  <TRow alignItems="center" justifyContent="space-between">
                    <TStack gap="$1">
                      <TText
                        variant="caption"
                        color="$placeholderColor"
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {t("sessions.routineList.rounds")}
                      </TText>
                      <THeading
                        level={2}
                        style={{
                          fontSize: 36,
                          fontWeight: "700",
                        }}
                      >
                        {routine.rounds}
                      </THeading>
                    </TStack>

                    <TStack alignItems="flex-end" gap="$1">
                      <TText
                        variant="caption"
                        color="$placeholderColor"
                        style={{
                          fontSize: 11,
                          textTransform: "uppercase",
                          letterSpacing: 0.5,
                        }}
                      >
                        {t("sessions.routineList.exercises")}
                      </TText>
                      <THeading
                        level={3}
                        style={{
                          fontSize: 24,
                          fontWeight: "600",
                        }}
                      >
                        {routine.exerciseCount}
                      </THeading>
                    </TStack>
                  </TRow>
                </TStack>

                {/* Body con detalles */}
                <TStack padding="$4" gap="$3">
                  {/* Stats secundarias */}
                  <TRow gap="$3" justifyContent="space-around">
                    <TStack alignItems="center" gap="$1">
                      <THeading level={4} style={{ fontSize: 20 }}>
                        {formatNumber(routine.totalReps)}
                      </THeading>
                      <TText
                        variant="caption"
                        color="$placeholderColor"
                        style={{ fontSize: 11, textTransform: "uppercase" }}
                      >
                        {t("sessions.labels.reps")}
                      </TText>
                    </TStack>

                    <TStack
                      width={1}
                      height="100%"
                      backgroundColor="$borderColor"
                    />

                    <TStack alignItems="center" gap="$1">
                      <THeading level={4} style={{ fontSize: 18 }}>
                        {formatDuration(routine.durationMs)}
                      </THeading>
                      <TText
                        variant="caption"
                        color="$placeholderColor"
                        style={{ fontSize: 11, textTransform: "uppercase" }}
                      >
                        {t("sessions.labels.duration")}
                      </TText>
                    </TStack>
                  </TRow>

                  {/* Fecha */}
                  <TText
                    variant="caption"
                    color="$placeholderColor"
                    style={{ textAlign: "center", fontSize: 12 }}
                  >
                    {formatDate(routine.completedAt)}
                  </TText>

                  {/* Divider */}
                  <TStack height={1} backgroundColor="$borderColor" />

                  {/* Actions */}
                  <TRow gap="$2" flexWrap="wrap">
                    <TButton
                      variant="primary"
                      flex={1}
                      minWidth={100}
                      onPress={() => handleStartRoutine(routine.id)}
                      iconName="play"
                      size="$3"
                    >
                      {t("sessions.routineList.actions.start")}
                    </TButton>
                    <TButton
                      variant="outline"
                      flex={1}
                      minWidth={100}
                      onPress={() => handleEditRoutine(routine.id)}
                      iconName="create-outline"
                      size="$3"
                    >
                      {t("sessions.routineList.actions.edit")}
                    </TButton>
                  </TRow>

                  <TRow gap="$2" flexWrap="wrap">
                    <TButton
                      variant="ghost"
                      flex={1}
                      iconAfterName="sparkles-outline"
                      onPress={() => handleAnalyzeRoutine(routine.id)}
                      size="$3"
                    >
                      {t("sessions.routineList.actions.analyze")}
                    </TButton>
                    <TButton
                      variant="ghost"
                      flex={1}
                      iconAfterName="eye-outline"
                      onPress={() => handleViewRoutineSummary(routine.id)}
                      size="$3"
                    >
                      {t("sessions.routineList.viewDetails")}
                    </TButton>
                  </TRow>
                </TStack>
              </TStack>
            ))}
          </TGrid>
        )}
      </TCard>
    </TPage>
  );
};

const styles = StyleSheet.create({
  stepTrackerMap: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default SessionsScreen;
