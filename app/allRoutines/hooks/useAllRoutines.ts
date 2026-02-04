import { useRouter } from "expo-router";
import { useCallback } from "react";

import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

import {
    formatDate,
    formatDuration,
    formatNumber,
} from "../../sessions/hooks/useSessions";

export const useAllRoutines = () => {
  const router = useRouter();

  const applyPlan = useRoutineBuilderStore((state) => state.applyPlan);
  const routineHistory = useRoutineSessionStore((state) => state.history);

  // Get full list of completed routines
  const routineListFull = routineHistory
    .filter((session) => session.completedAt)
    .map((session) => {
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
    });

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
    routineListFull,
    handleStartRoutine,
    handleEditRoutine,
    handleAnalyzeRoutine,
    handleViewRoutineSummary,
    formatDate,
    formatDuration,
    formatNumber,
  };
};
