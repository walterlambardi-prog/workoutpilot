import { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import type { SpaceTokens } from "tamagui";
import { useMedia } from "tamagui";

import { EXERCISE_COPY_KEYS } from "@/constants/exercises";

import type { ExercisesProps } from "../exercises.types";
import { useWebPoseDetection } from "./useWebPoseDetection";

export const useExerciseSessionWeb = ({
  exerciseId,
  routineContext,
}: ExercisesProps) => {
  const {
    status,
    messageKey,
    stats,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  } = useWebPoseDetection(
    exerciseId,
    routineContext?.stepIndex,
    routineContext,
  );

  const { t } = useTranslation();
  const media = useMedia();

  const autoStartAttemptedRef = useRef(false);
  const advanceRef = useRef(false);
  const lastStepIndexRef = useRef<number | null>(null);

  // Auto-start camera when ready
  useEffect(() => {
    if (status !== "ready" || autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;
    startCamera();
  }, [status, startCamera]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      autoStartAttemptedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  // Reset advance flag when exercise or step changes
  useEffect(() => {
    advanceRef.current = false;
  }, [exerciseId, routineContext?.routineId, routineContext?.stepIndex]);

  // Routine integration
  const routineIsActive = routineContext?.isActive ?? false;
  const routineStepIndex = routineContext?.stepIndex ?? null;
  const routineTargetReps = routineContext?.targetReps ?? 0;
  const routineOnProgress = routineContext?.onProgress;
  const routineOnComplete = routineContext?.onComplete;
  const repCount = stats?.repCount;

  useEffect(() => {
    if (!routineIsActive) {
      lastStepIndexRef.current = null;
      return;
    }

    const stepChanged = routineStepIndex !== lastStepIndexRef.current;

    if (stepChanged && (repCount ?? 0) > 0) return;

    if (stepChanged) lastStepIndexRef.current = routineStepIndex;

    if (typeof repCount !== "number") return;

    routineOnProgress?.(repCount);

    if (repCount >= routineTargetReps && routineTargetReps > 0) {
      if (!advanceRef.current) {
        advanceRef.current = true;
        routineOnComplete?.(repCount);
      }
    } else {
      advanceRef.current = false;
    }
  }, [
    repCount,
    routineIsActive,
    routineOnComplete,
    routineOnProgress,
    routineStepIndex,
    routineTargetReps,
  ]);

  // Header content
  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.web.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.web.subtitle");

  // Primary chip
  const primaryChip = useMemo(() => {
    if (routineContext?.isActive && routineContext.targetReps > 0) {
      const safeProgress = Math.max(
        0,
        Math.min(routineContext.targetReps, stats?.repCount ?? 0),
      );
      return {
        key: "target",
        label: t("routineRun.chips.target"),
        value: `${safeProgress}/${routineContext.targetReps}`,
      };
    }

    if (typeof stats?.repCount === "number") {
      return {
        key: "reps",
        label: t("exercises.web.reps"),
        value: String(stats.repCount),
      };
    }

    return null;
  }, [routineContext, stats?.repCount, t]);

  // Hero chips
  const heroChips = useMemo(() => {
    if (routineContext?.isActive && routineContext.targetReps > 0) {
      return [
        {
          key: "round",
          label: t("routineRun.chips.round"),
          value: `${routineContext.currentRound}/${routineContext.totalRounds}`,
        },
        {
          key: "step",
          label: t("routineRun.chips.step"),
          value: `${routineContext.stepIndex + 1}/${routineContext.totalSteps}`,
        },
      ];
    }
    return [];
  }, [routineContext, t]);

  // Progress calculation
  const progress = useMemo(() => {
    if (!routineContext?.isActive || !routineContext.targetReps) return null;

    const completed = Math.max(
      0,
      Math.min(routineContext.targetReps, stats?.repCount ?? 0),
    );
    const target = routineContext.targetReps;
    const ratio = target > 0 ? completed / target : 0;

    let nextExerciseTitle: string | null = null;
    if (routineContext.nextExerciseId) {
      const nextCopyKey = EXERCISE_COPY_KEYS[routineContext.nextExerciseId];
      nextExerciseTitle = nextCopyKey ? t(`${nextCopyKey}.title`) : null;
    }

    return { completed, target, ratio, nextExerciseTitle };
  }, [routineContext, stats?.repCount, t]);

  // Responsive sizes
  const heroTitleSize = media.md ? 34 : 28;
  const heroSubtitleSize = media.md ? 18 : 16;
  const overlayPadding: SpaceTokens = media.md ? "$6" : "$4";
  const topRightPadding: SpaceTokens = media.lg
    ? "$10"
    : media.md
      ? "$6"
      : "$1";

  // Camera status
  const isCameraRunning = status === "running";

  // Skip to next exercise (manual)
  const handleSkipExercise = () => {
    if (!routineIsActive || !routineOnComplete) return;
    const currentReps = stats?.repCount ?? 0;
    advanceRef.current = true;
    routineOnComplete(currentReps);
  };

  // Finish entire routine (manual)
  const handleFinishRoutine = () => {
    if (!routineIsActive || !routineContext?.routineId) return;
    stopCamera();
    // Navigate to routine complete screen
    // The useRoutineStep hook will handle the session completion
    import("expo-router").then(({ router }) => {
      router.replace("/routine/complete");
    });
  };

  return {
    // Camera
    status,
    videoRef,
    canvasRef,
    isCameraRunning,
    startCamera,
    stopCamera,

    // Detection
    messageKey,
    stats,

    // Header
    headerTitle,
    headerSubtitle,

    // Chips
    primaryChip,
    heroChips,

    // Progress
    progress,
    routineIsActive,
    hasNextExercise: !!routineContext?.nextExerciseId,
    handleSkipExercise,
    handleFinishRoutine,

    // Responsive
    media,
    heroTitleSize,
    heroSubtitleSize,
    overlayPadding,
    topRightPadding,
  };
};
