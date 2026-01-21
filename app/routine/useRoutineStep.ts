import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { ExerciseId } from "@/constants/exercises";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const toStepIndex = (value?: string | null) => {
  const parsed = value ? Number(value) : NaN;
  if (!Number.isFinite(parsed)) return 0;
  return Math.max(0, Math.floor(parsed));
};

export const useRoutineStep = (exerciseId?: ExerciseId) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const routineIdParam = normalizeParam(params.routineId) ?? null;
  const stepIndexParam = normalizeParam(params.stepIndex) ?? null;
  const stepIndexFromParams = toStepIndex(stepIndexParam);

  const session = useRoutineSessionStore((state) => state.activeSession);
  const recordProgress = useRoutineSessionStore(
    (state) => state.recordProgress,
  );
  const completeCurrentStep = useRoutineSessionStore(
    (state) => state.completeCurrentStep,
  );
  const jumpToStep = useRoutineSessionStore((state) => state.jumpToStep);
  const resetActive = useRoutineSessionStore((state) => state.resetActive);

  const isRoutine = Boolean(routineIdParam);
  const routineId = routineIdParam;

  const handledMissingSessionRef = useRef(false);
  const appliedInitialStepRef = useRef(false);
  const pendingSyncRef = useRef<{
    routineId: string | null;
    stepIndex: number;
  } | null>(null);

  useEffect(() => {
    if (!isRoutine) return;
    if (!session || (routineId && session.id !== routineId)) {
      if (handledMissingSessionRef.current) {
        return;
      }
      handledMissingSessionRef.current = true;
      resetActive();
      router.replace("/routine");
      return;
    }

    handledMissingSessionRef.current = false;
  }, [isRoutine, resetActive, router, routineId, session]);

  // Allow a single deep-link jump to a later step. After that, the store is the
  // source of truth and the route is kept in sync with the store.
  useEffect(() => {
    if (!isRoutine || !session) return;
    if (appliedInitialStepRef.current) return;

    const clamped = Math.min(
      Math.max(0, stepIndexFromParams),
      session.plan.length - 1,
    );

    if (clamped !== session.currentStepIndex) {
      jumpToStep(clamped);
    }

    appliedInitialStepRef.current = true;
  }, [isRoutine, jumpToStep, session, stepIndexFromParams]);

  const currentStep = useMemo(() => {
    if (!isRoutine || !session) return null;
    return session.plan[session.currentStepIndex] ?? null;
  }, [isRoutine, session]);

  const nextStep = useMemo(() => {
    if (!isRoutine || !session) return null;
    return session.plan[session.currentStepIndex + 1] ?? null;
  }, [isRoutine, session]);

  // Keep the route aligned with the store's active step (exercise + index).
  useEffect(() => {
    if (!isRoutine || !session || !currentStep) return;
    if (!exerciseId) return;

    const needsSync =
      exerciseId !== currentStep.exerciseId ||
      stepIndexFromParams !== session.currentStepIndex;

    const target = {
      routineId: session.id,
      stepIndex: session.currentStepIndex,
    } as const;

    if (!needsSync) {
      pendingSyncRef.current = null;
      return;
    }

    const pending = pendingSyncRef.current;
    if (
      pending &&
      pending.routineId === target.routineId &&
      pending.stepIndex === target.stepIndex
    ) {
      return;
    }

    pendingSyncRef.current = target;
    router.replace({
      pathname: "/exercises/[exerciseId]",
      params: {
        exerciseId: currentStep.exerciseId,
        routineId: session.id,
        stepIndex: String(session.currentStepIndex),
      },
    });
  }, [
    currentStep,
    exerciseId,
    isRoutine,
    pendingSyncRef,
    router,
    session,
    stepIndexFromParams,
  ]);

  const handleProgress = useCallback(
    (reps: number) => {
      if (!isRoutine || !session) return;
      recordProgress(reps);
    },
    [isRoutine, recordProgress, session],
  );

  const handleComplete = useCallback(
    (reps: number) => {
      if (!isRoutine || !session) return;

      const {
        nextStep: following,
        completedSession,
        nextStepIndex,
      } = completeCurrentStep({ repsOverride: reps });

      if (
        following &&
        session.plan[nextStepIndex ?? session.currentStepIndex + 1]
      ) {
        router.replace({
          pathname: "/exercises/[exerciseId]",
          params: {
            exerciseId: following.exerciseId,
            routineId: session.id,
            stepIndex: String(nextStepIndex ?? session.currentStepIndex + 1),
          },
        });
        return;
      }

      const resolvedSessionId = completedSession?.id ?? session.id;
      router.replace({
        pathname: "/routine/complete",
        params: { sessionId: resolvedSessionId },
      });
    },
    [completeCurrentStep, isRoutine, router, session],
  );

  return {
    isRoutine,
    routineId,
    targetReps: currentStep?.targetReps ?? null,
    currentRound: currentStep?.round ?? null,
    totalRounds: session?.rounds ?? null,
    stepIndex: session?.currentStepIndex ?? null,
    totalSteps: session?.plan.length ?? null,
    nextExerciseId: nextStep?.exerciseId ?? null,
    onProgress: handleProgress,
    onComplete: handleComplete,
  } as const;
};
