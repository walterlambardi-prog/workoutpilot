import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import {
    type RoutineSession,
    useRoutineSessionStore,
} from "@/stores/routineSessionStore";
import { useStepTrackerStore } from "@/stores/stepTrackerStore";

import { MAX_PREVIEW_ITEMS } from "../sessions.constants";
import type { RoutineListItem } from "../sessions.types";

export const formatDuration = (ms?: number) => {
  if (!ms || ms < 0) return "--";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

export const formatDate = (timestamp?: number) => {
  if (!timestamp) return "--";
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const formatNumber = (value?: number) => {
  if (!value) return "0";
  return value.toLocaleString();
};

export const useSessions = () => {
  const { t } = useTranslation();
  const router = useRouter();

  // Store data
  const { currentSession, history } = useExerciseSessionStore();
  const applyPlan = useRoutineBuilderStore((state) => state.applyPlan);
  const { history: routineHistory, lastCompletedSession } =
    useRoutineSessionStore();
  const stepTrackerHistory = useStepTrackerStore((state) => state.history);

  // Format helpers
  const formatDistance = useCallback(
    (distanceKm: number) =>
      t("stepTracker.stats.distanceValue", { distance: distanceKm.toFixed(2) }),
    [t],
  );

  // Exercise session totals
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

  // Step tracker session totals
  const stepTrackerTotals = useMemo(() => {
    const totalSteps = stepTrackerHistory.reduce(
      (sum, entry) => sum + (entry.steps ?? 0),
      0,
    );
    const totalDistanceKm = stepTrackerHistory.reduce(
      (sum, entry) => sum + (entry.distanceKm ?? 0),
      0,
    );
    const totalDurationMs = stepTrackerHistory.reduce(
      (sum, entry) => sum + (entry.durationMs ?? 0),
      0,
    );
    const lastSession = stepTrackerHistory[0] ?? null;

    return {
      totalSteps,
      totalDistanceKm,
      totalDurationMs,
      lastSession,
    };
  }, [stepTrackerHistory]);

  // Routine sessions
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

  // Top exercise across all session types
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

  // Formatted copy strings
  const bestSessionCopy = useMemo(() => {
    if (!totals.bestSession) return t("sessions.empty.bestSession");
    const exercise =
      EXERCISE_DEFINITION_MAP[totals.bestSession.exerciseId as ExerciseId];
    const reps = formatNumber(totals.bestSession.reps ?? 0);
    return `${t(`${exercise.copyKey}.title`)} · ${reps} ${t("sessions.labels.reps")}`;
  }, [t, totals.bestSession]);

  const bestSessionDateCopy = useMemo(() => {
    if (!totals.bestSession) return undefined;
    const endedAt = formatDate(
      totals.bestSession.endedAt ?? totals.bestSession.startedAt,
    );
    return endedAt;
  }, [totals.bestSession]);

  const topExerciseCopy = useMemo(() => {
    if (!topExercise) return t("sessions.empty.topExercise");
    const exercise = EXERCISE_DEFINITION_MAP[topExercise.exerciseId];
    return `${t(`${exercise.copyKey}.title`)} · ${formatNumber(topExercise.reps)} ${t("sessions.labels.reps")}`;
  }, [t, topExercise]);

  // Stat highlights for dashboard
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
        helper: bestSessionDateCopy,
      },
    ],
    [bestSessionCopy, bestSessionDateCopy, t, topExerciseCopy, totals],
  );

  // Routine list for UI
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

  // Actions
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

  return {
    // Data
    totals,
    stepTrackerTotals,
    stepTrackerHistory: stepTrackerHistory.slice(0, MAX_PREVIEW_ITEMS),
    stepTrackerHistoryFull: stepTrackerHistory,
    hasMoreStepTrackers: stepTrackerHistory.length > MAX_PREVIEW_ITEMS,
    routineList: routineList.slice(0, MAX_PREVIEW_ITEMS),
    routineListFull: routineList,
    hasMoreRoutines: routineList.length > MAX_PREVIEW_ITEMS,
    statHighlights,

    // Formatters
    formatDistance,
    formatDuration,
    formatDate,
    formatNumber,

    // Actions
    handleStartRoutine,
    handleEditRoutine,
    handleAnalyzeRoutine,
    handleViewRoutineSummary,
  };
};
