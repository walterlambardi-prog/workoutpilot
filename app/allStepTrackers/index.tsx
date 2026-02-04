import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import MapView from "@/components/MapView";
import ScreenHeader from "@/components/ScreenHeader";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";
import type { StepTrackerSessionEntry } from "@/stores/stepTrackerStore";

import styles from "./allStepTrackers.styles";
import { useAllStepTrackers } from "./hooks/useAllStepTrackers";

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <TText variant="caption" color="$placeholderColor">
    {text}
  </TText>
);

const AllStepTrackersScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    stepTrackerHistoryFull,
    formatDistance,
    formatDate,
    formatDuration,
    formatNumber,
  } = useAllStepTrackers();

  return (
    <TPage backgroundColor="$background" hasHeader gap="$4">
      <ScreenHeader
        title={t("sessions.stepTracker.allTitle")}
        subtitle={t("sessions.stepTracker.allSubtitle")}
      />

      {stepTrackerHistoryFull.length === 0 ? (
        <EmptyState text={t("sessions.stepTracker.empty")} />
      ) : (
        <TGrid columns={Platform.OS === "web" ? 3 : 1} gap="$3">
          {stepTrackerHistoryFull.map((entry: StepTrackerSessionEntry) => (
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
    </TPage>
  );
};

export default AllStepTrackersScreen;
