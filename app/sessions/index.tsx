import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Platform, StyleSheet } from "react-native";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import MapView from "@/components/MapView";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";
import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import {
  type RoutineSession,
  useRoutineSessionStore,
} from "@/stores/routineSessionStore";
import { useWalkingSessionStore } from "@/stores/walkingSessionStore";

import ActivityHeatmap from "@/components/ActivityHeatmap";
import type { RoutineListItem } from "./sessions.types";

const formatDuration = (ms?: number) => {
  if (!ms || ms < 0) return "--";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "--";
  return new Date(timestamp).toLocaleString();
};

const formatNumber = (value?: number) => {
  if (!value) return "0";
  return value.toLocaleString();
};

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
  const router = useRouter();
  const { currentSession, history } = useExerciseSessionStore();
  const applyPlan = useRoutineBuilderStore((state) => state.applyPlan);
  const { history: routineHistory, lastCompletedSession } =
    useRoutineSessionStore();
  const walkingHistory = useWalkingSessionStore((state) => state.history);

  const formatDistance = useCallback(
    (distanceKm: number) =>
      t("walking.stats.distanceValue", { distance: distanceKm.toFixed(2) }),
    [t],
  );

  const totals = useMemo(() => {
    const now = Date.now();
    const sessions = [
      ...history,
      ...(currentSession
        ? [
            {
              ...currentSession,
              durationMs:
                currentSession.durationMs ?? now - currentSession.startedAt,
            },
          ]
        : []),
    ];

    const totalSessions = sessions.length;
    const totalReps = sessions.reduce((sum, s) => sum + (s.reps ?? 0), 0);
    const totalDurationMs = sessions.reduce(
      (sum, s) => sum + (s.durationMs ?? 0),
      0,
    );
    const bestSession = sessions.reduce(
      (best, s) => (s.reps > (best?.reps ?? 0) ? s : best),
      undefined as typeof currentSession | undefined,
    );
    const lastSession = history[0] ?? currentSession ?? null;
    const uniqueExercises = new Set(
      sessions.map((s) => s.exerciseId as ExerciseId),
    ).size;

    return {
      totalSessions,
      totalReps,
      totalDurationMs,
      bestSession,
      lastSession,
      averageReps:
        totalSessions > 0 ? Math.round(totalReps / totalSessions) : 0,
      uniqueExercises,
    };
  }, [currentSession, history]);

  const walkingTotals = useMemo(() => {
    const totalSteps = walkingHistory.reduce(
      (sum, entry) => sum + (entry.steps ?? 0),
      0,
    );
    const totalDistanceKm = walkingHistory.reduce(
      (sum, entry) => sum + (entry.distanceKm ?? 0),
      0,
    );
    const totalDurationMs = walkingHistory.reduce(
      (sum, entry) => sum + (entry.durationMs ?? 0),
      0,
    );
    const lastSession = walkingHistory[0] ?? null;

    return {
      totalSteps,
      totalDistanceKm,
      totalDurationMs,
      lastSession,
    };
  }, [walkingHistory]);

  const walkingRecent = useMemo(
    () => walkingHistory.slice(0, 3),
    [walkingHistory],
  );

  const routineSessions = useMemo(() => {
    const sessions: RoutineSession[] = [...routineHistory];
    if (
      lastCompletedSession &&
      !sessions.find((entry) => entry.id === lastCompletedSession.id)
    ) {
      sessions.unshift(lastCompletedSession);
    }
    return sessions;
  }, [lastCompletedSession, routineHistory]);

  const topExercise = useMemo(() => {
    const exerciseTotals: Record<ExerciseId, number> = {} as Record<
      ExerciseId,
      number
    >;

    history.forEach((entry) => {
      exerciseTotals[entry.exerciseId] =
        (exerciseTotals[entry.exerciseId] ?? 0) + (entry.reps ?? 0);
    });

    routineSessions.forEach((session) => {
      session.stepResults.forEach((step) => {
        exerciseTotals[step.exerciseId] =
          (exerciseTotals[step.exerciseId] ?? 0) + step.reps;
      });
    });

    return Object.entries(exerciseTotals).reduce(
      (best, [exerciseId, reps]) => {
        if (!best || reps > best.reps) {
          return { exerciseId: exerciseId as ExerciseId, reps };
        }
        return best;
      },
      null as { exerciseId: ExerciseId; reps: number } | null,
    );
  }, [history, routineSessions]);

  const bestSessionCopy = useMemo(() => {
    if (!totals.bestSession) return t("sessions.empty.bestSession");
    const exercise =
      EXERCISE_DEFINITION_MAP[totals.bestSession.exerciseId as ExerciseId];
    const reps = formatNumber(totals.bestSession.reps ?? 0);
    return `${t(`${exercise.copyKey}.title`)} · ${reps} ${t("sessions.labels.reps")}`;
  }, [t, totals.bestSession]);

  const lastSessionCopy = useMemo(() => {
    if (!totals.lastSession) return t("sessions.empty.lastSession");
    const exercise =
      EXERCISE_DEFINITION_MAP[totals.lastSession.exerciseId as ExerciseId];
    const endedAt = formatDate(
      totals.lastSession.endedAt ?? totals.lastSession.startedAt,
    );
    return `${t(`${exercise.copyKey}.title`)} · ${endedAt}`;
  }, [t, totals.lastSession]);

  const topExerciseCopy = useMemo(() => {
    if (!topExercise) return t("sessions.empty.topExercise");
    const exercise = EXERCISE_DEFINITION_MAP[topExercise.exerciseId];
    return `${t(`${exercise.copyKey}.title`)} · ${formatNumber(topExercise.reps)} ${t("sessions.labels.reps")}`;
  }, [t, topExercise]);

  const statHighlights = useMemo(
    () => [
      {
        key: "volume",
        label: t("sessions.stats.totalReps"),
        value: formatNumber(totals.totalReps),
        helper: `${t("sessions.stats.totalSessions")}: ${formatNumber(
          totals.totalSessions,
        )}`,
      },
      {
        key: "time",
        label: t("sessions.stats.totalDuration"),
        value: formatDuration(totals.totalDurationMs),
        helper: `${t("sessions.stats.averageReps")}: ${formatNumber(
          totals.averageReps,
        )}`,
      },
      {
        key: "coverage",
        label: t("sessions.stats.exercisesTracked"),
        value: formatNumber(totals.uniqueExercises),
        helper: topExerciseCopy,
      },
      {
        key: "recency",
        label: t("sessions.stats.bestSession"),
        value: bestSessionCopy,
        helper: lastSessionCopy,
      },
    ],
    [bestSessionCopy, lastSessionCopy, t, topExerciseCopy, totals],
  );

  const routineList: RoutineListItem[] = useMemo(
    () =>
      routineHistory
        .filter((session) => session.completedAt)
        .map((session): RoutineListItem => {
          const uniqueExercises = new Set(
            session.plan.map((step) => step.exerciseId),
          ).size;
          const durationMs = session.completedAt
            ? session.completedAt - session.startedAt
            : 0;

          return {
            id: session.id,
            rounds: session.rounds,
            totalReps: session.totalReps,
            exerciseCount: uniqueExercises,
            durationMs,
            completedAt: session.completedAt ?? session.startedAt,
          };
        }),
    [routineHistory],
  );

  const handleStartRoutine = useCallback(
    (routineId: string) => {
      const sessionId = useRoutineSessionStore
        .getState()
        .restartFromSession(routineId);
      if (!sessionId) return;

      const activeSession = useRoutineSessionStore.getState().activeSession;
      const firstStep = activeSession?.plan[0];

      if (firstStep) {
        router.push({
          pathname: "/exercises/[exerciseId]",
          params: {
            exerciseId: firstStep.exerciseId,
            routineId: sessionId,
            stepIndex: "0",
          },
        });
      }
    },
    [router],
  );

  const handleEditRoutine = useCallback(
    (routineId: string) => {
      const fullSession = routineHistory.find(
        (session) => session.id === routineId,
      );
      if (fullSession) {
        const planBase = fullSession.plan.map((step) => ({
          exerciseId: step.exerciseId,
          targetReps: step.targetReps,
        }));
        applyPlan(planBase, fullSession.rounds);
      }
      router.push("/routine");
    },
    [applyPlan, routineHistory, router],
  );

  const handleAnalyzeRoutine = useCallback(
    (routineId: string) => {
      router.push({ pathname: "/routineAnalysis", params: { routineId } });
    },
    [router],
  );

  const handleViewRoutineSummary = useCallback(
    (routineId: string) => {
      router.push({
        pathname: "/routine/complete",
        params: { sessionId: routineId },
      });
    },
    [router],
  );

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
        <THeading level={3}>{t("sessions.walking.title")}</THeading>

        <TGrid columns={Platform.OS === "web" ? 3 : 1} gap="$3">
          <StatTile
            label={t("sessions.walking.totalSteps")}
            value={formatNumber(walkingTotals.totalSteps)}
          />
          <StatTile
            label={t("sessions.walking.totalDistance")}
            value={formatDistance(walkingTotals.totalDistanceKm)}
          />
          <StatTile
            label={t("sessions.walking.totalTime")}
            value={formatDuration(walkingTotals.totalDurationMs)}
          />
        </TGrid>

        {walkingRecent.length === 0 ? (
          <EmptyState text={t("sessions.walking.empty")} />
        ) : (
          <TGrid columns={Platform.OS === "web" ? 3 : 1} gap="$3">
            {walkingRecent.map((entry) => (
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
                      {t("walking.stats.distance")}
                    </TText>
                    <THeading level={4}>
                      {formatDistance(entry.distanceKm)}
                    </THeading>
                  </TStack>
                  <TStack alignItems="flex-end" gap="$1">
                    <TText variant="label" color="$placeholderColor">
                      {t("walking.stats.steps")}
                    </TText>
                    <THeading level={4}>{formatNumber(entry.steps)}</THeading>
                  </TStack>
                </TRow>

                <TRow justifyContent="space-between" alignItems="center">
                  <TStack gap="$1">
                    <TText variant="caption" color="$placeholderColor">
                      {t("walking.stats.duration")}
                    </TText>
                    <THeading level={4}>
                      {formatDuration(entry.durationMs)}
                    </THeading>
                  </TStack>
                  <TText variant="caption" color="$placeholderColor">
                    {formatDate(entry.endedAt ?? entry.startedAt)}
                  </TText>
                </TRow>

                <TStack borderRadius="$6" overflow="hidden">
                  <MapView
                    positions={entry.positions}
                    style={styles.walkingMap}
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
  walkingMap: {
    height: 220,
    borderRadius: 12,
    overflow: "hidden",
  },
});

export default SessionsScreen;
