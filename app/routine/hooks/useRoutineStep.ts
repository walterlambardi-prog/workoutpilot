import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef } from "react";

import { ExerciseId } from "@/constants/exercises";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

const debug = (...args: unknown[]) => {
  if (__DEV__) {
    console.log("[useRoutineStep]", ...args);
  }
};

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
  const jumpToStep = useRoutineSessionStore((state) => state.jumpToStep);
  const resetActive = useRoutineSessionStore((state) => state.resetActive);

  const activeSessionIdRef = useRef<string | null>(null);

  const isRoutine = Boolean(routineIdParam);
  const routineId = routineIdParam;

  const handledMissingSessionRef = useRef(false);
  const awaitingCompletionRef = useRef(false);
  const completionGuardRef = useRef(false);
  const completionNavigatedRef = useRef(false);
  const navigatingToRestRef = useRef(false);
  const appliedInitialStepRef = useRef(false);
  const pendingSyncRef = useRef<{
    routineId: string | null;
    stepIndex: number;
  } | null>(null);

  useEffect(() => {
    const nextSessionId = session?.id ?? null;
    const prevSessionId = activeSessionIdRef.current;
    const sessionChanged = nextSessionId !== prevSessionId;

    if (sessionChanged) {
      debug("sessionChanged", { prevSessionId, nextSessionId });
    }

    // When the session completes, the store clears activeSession. Preserve the
    // completion flags so we can finish navigation to the complete screen
    // without bouncing back to the builder.
    if (sessionChanged && !session && completionNavigatedRef.current) {
      debug("sessionClearedAfterCompletionNavigation");
      activeSessionIdRef.current = nextSessionId;
      awaitingCompletionRef.current = false;
      return;
    }

    if (sessionChanged && awaitingCompletionRef.current && !session) {
      debug("sessionClearedWhileAwaitingCompletion");
      activeSessionIdRef.current = nextSessionId;
      awaitingCompletionRef.current = false;
      return;
    }

    activeSessionIdRef.current = nextSessionId;

    if (sessionChanged) {
      awaitingCompletionRef.current = false;
      completionGuardRef.current = false;
      completionNavigatedRef.current = false;
      navigatingToRestRef.current = false;
      appliedInitialStepRef.current = false;
      pendingSyncRef.current = null;
      handledMissingSessionRef.current = false;
      debug("resetFlagsAfterSessionChange");
    }

    if (session && !awaitingCompletionRef.current) {
      completionGuardRef.current = false;
      completionNavigatedRef.current = false;
    }
  }, [session]);

  useEffect(() => {
    if (!isRoutine) return;
    if (completionNavigatedRef.current) return;
    if (awaitingCompletionRef.current) return;
    if (!session || (routineId && session.id !== routineId)) {
      if (handledMissingSessionRef.current) {
        return;
      }

      handledMissingSessionRef.current = true;
      debug("missingSessionRedirect", { routineId, sessionId: session?.id });
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
    if (completionNavigatedRef.current) return;
    if (appliedInitialStepRef.current) return;

    const clamped = Math.min(
      Math.max(0, stepIndexFromParams),
      session.plan.length - 1,
    );

    if (clamped !== session.currentStepIndex) {
      jumpToStep(clamped);
      debug("initialStepJump", {
        fromParam: stepIndexFromParams,
        clamped,
        sessionIndex: session.currentStepIndex,
      });
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
    if (completionNavigatedRef.current) return;
    if (awaitingCompletionRef.current) return;
    if (navigatingToRestRef.current) return;
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
    debug("syncRouteToStore", {
      currentExercise: exerciseId,
      targetExercise: currentStep.exerciseId,
      paramStep: stepIndexFromParams,
      storeStep: session.currentStepIndex,
      routineId: session.id,
    });
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
    router,
    session,
    stepIndexFromParams,
  ]);

  const handleProgress = useCallback(
    (reps: number) => {
      if (!isRoutine) return;

      const state = useRoutineSessionStore.getState();
      const activeSession = state.activeSession;

      if (!activeSession) return;
      if (
        activeSessionIdRef.current &&
        activeSession.id !== activeSessionIdRef.current
      ) {
        return;
      }

      state.recordProgress(reps);
      debug("progress", {
        reps,
        step: activeSession.currentStepIndex,
        sessionId: activeSession.id,
      });
    },
    [isRoutine],
  );

  const handleComplete = useCallback(
    (reps: number) => {
      if (!isRoutine) return;
      if (completionNavigatedRef.current) return;
      if (completionGuardRef.current) return;

      const state = useRoutineSessionStore.getState();
      const activeSession = state.activeSession;

      if (!activeSession) return;
      if (
        activeSessionIdRef.current &&
        activeSession.id !== activeSessionIdRef.current
      ) {
        return;
      }

      const isFinalStep =
        activeSession.currentStepIndex >= activeSession.plan.length - 1;

      if (isFinalStep) {
        awaitingCompletionRef.current = true;
        completionGuardRef.current = true;
        debug("finalStepCompleteStart", {
          sessionId: activeSession.id,
          stepIndex: activeSession.currentStepIndex,
        });
      }

      const {
        nextStep: following,
        completedSession,
        nextStepIndex,
      } = state.completeCurrentStep({ repsOverride: reps });

      if (!completedSession && isFinalStep) {
        awaitingCompletionRef.current = false;
        completionGuardRef.current = false;
        debug("finalStepCompleteCancelled", {
          sessionId: activeSession.id,
          stepIndex: activeSession.currentStepIndex,
        });
      }

      if (following && nextStepIndex !== null) {
        // Check if we should show a rest screen before the next exercise
        const restSec = activeSession.restSeconds ?? 0;
        if (restSec > 0) {
          navigatingToRestRef.current = true;
          debug("navigateToRest", {
            nextStepIndex,
            restSeconds: restSec,
            sessionId: activeSession.id,
          });
          router.replace({
            pathname: "/routine/rest",
            params: {
              routineId: activeSession.id,
              nextExerciseId: following.exerciseId,
              nextStepIndex: String(nextStepIndex),
              restSeconds: String(restSec),
            },
          });
        } else {
          debug("advanceToNextStep", {
            nextStepIndex,
            exerciseId: following.exerciseId,
            sessionId: activeSession.id,
          });
          router.replace({
            pathname: "/exercises/[exerciseId]",
            params: {
              exerciseId: following.exerciseId,
              routineId: activeSession.id,
              stepIndex: String(nextStepIndex),
            },
          });
        }
        return;
      }

      if (completionNavigatedRef.current) return;
      completionNavigatedRef.current = true;

      const resolvedSessionId = (completedSession ?? activeSession).id;
      debug("navigateToComplete", { resolvedSessionId });
      router.replace({
        pathname: "/routine/complete",
        params: { sessionId: resolvedSessionId },
      });
    },
    [isRoutine, router],
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
