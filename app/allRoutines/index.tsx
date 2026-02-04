import React from "react";
import { useTranslation } from "react-i18next";
import { Platform } from "react-native";

import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";

import type { RoutineListItem } from "./allRoutines.types";
import { useAllRoutines } from "./hooks/useAllRoutines";

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <TText variant="caption" color="$placeholderColor">
    {text}
  </TText>
);

const AllRoutinesScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    routineListFull,
    handleStartRoutine,
    handleEditRoutine,
    handleAnalyzeRoutine,
    handleViewRoutineSummary,
    formatDate,
    formatDuration,
    formatNumber,
  } = useAllRoutines();

  return (
    <TPage backgroundColor="$background" hasHeader gap="$4">
      <ScreenHeader
        title={t("sessions.routineList.allTitle")}
        subtitle={t("sessions.routineList.allSubtitle")}
      />

      {routineListFull.length === 0 ? (
        <EmptyState text={t("sessions.routineList.empty")} />
      ) : (
        <TGrid columns={Platform.OS === "web" ? 3 : 1} gap="$4">
          {routineListFull.map((routine: RoutineListItem) => (
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
    </TPage>
  );
};

export default AllRoutinesScreen;
