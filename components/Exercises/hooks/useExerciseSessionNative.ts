import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

import { CAMERA_HEIGHT, CAMERA_WIDTH } from "../exercises.constants";
import type { ExercisesProps } from "../exercises.types";
import { usePoseDetection } from "./usePoseDetection";

export const useExerciseSessionNative = ({
  exerciseId,
  routineContext,
}: ExercisesProps) => {
  const screenKey = `${exerciseId ?? "unknown"}-${routineContext?.stepIndex ?? "solo"}`;
  const [showCamera, setShowCamera] = useState(false);
  const [cameraSessionKey, setCameraSessionKey] = useState(0);
  const isFirstRenderRef = useRef(true);
  const remountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();

  const { messageKey, repCount, feedback, handleLandmark, handleSwitchCamera } =
    usePoseDetection({
      exerciseId,
      t,
      resetKey: routineContext?.stepIndex,
      routineContext,
    });

  const advanceRef = useRef(false);
  const lastStepIndexRef = useRef<number | null>(null);

  // Reset advance flag when exercise or step changes
  useEffect(() => {
    advanceRef.current = false;
  }, [exerciseId, routineContext?.routineId, routineContext?.stepIndex]);

  // Force camera remount when routine step/exercise changes
  useEffect(() => {
    if (remountTimerRef.current) {
      clearTimeout(remountTimerRef.current);
    }

    const delay = isFirstRenderRef.current ? 220 : 300;
    isFirstRenderRef.current = false;

    setShowCamera(false);
    remountTimerRef.current = setTimeout(() => {
      setCameraSessionKey((prev) => prev + 1);
      setShowCamera(true);
    }, delay);

    return () => {
      if (remountTimerRef.current) {
        clearTimeout(remountTimerRef.current);
        remountTimerRef.current = null;
      }
      setShowCamera(true);
    };
  }, [screenKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (remountTimerRef.current) {
        clearTimeout(remountTimerRef.current);
      }
      setShowCamera(true);
    };
  }, []);

  // Routine integration
  const routineIsActive = routineContext?.isActive ?? false;
  const routineStepIndex = routineContext?.stepIndex ?? null;
  const routineTargetReps = routineContext?.targetReps ?? 0;
  const routineOnProgress = routineContext?.onProgress;
  const routineOnComplete = routineContext?.onComplete;

  useEffect(() => {
    if (!routineIsActive) {
      lastStepIndexRef.current = null;
      return;
    }

    const stepChanged = routineStepIndex !== lastStepIndexRef.current;

    if (stepChanged && (repCount ?? 0) > 0) {
      return;
    }

    if (stepChanged) {
      lastStepIndexRef.current = routineStepIndex;
    }

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
    : t("exercises.native.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.native.subtitle");

  // Dimensions and insets
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const cameraWidth = Math.max(width, CAMERA_WIDTH);
  const cameraHeight = Math.max(height, CAMERA_HEIGHT);

  // Theme colors
  const scrimColor = useThemeColor(
    { light: "rgba(7,12,22,0)", dark: "rgba(15,23,42,0.45)" },
    "background",
  );

  const overlayBorder = useThemeColor(
    { light: "rgba(15,23,42,0.15)", dark: "rgba(248,250,252,0.12)" },
    "background",
  );
  const overlayHeading = useThemeColor(
    { light: "#f8fafc", dark: "#f8fafc" },
    "text",
  );
  const overlayMuted = useThemeColor(
    { light: "rgba(226,232,240,0.9)", dark: "rgba(148,163,184,0.9)" },
    "text",
  );
  const cardBackground = useThemeColor(
    { light: "rgba(15,23,42,0.35)", dark: "rgba(15,23,42,0.45)" },
    "background",
  );
  const messageColor = useThemeColor(
    { light: "#e2e8f0", dark: "#cbd5f5" },
    "text",
  );
  const accentColor = useThemeColor({}, "tint");

  // Primary chip
  const primaryChip = useMemo(() => {
    if (routineContext?.isActive && routineContext.targetReps > 0) {
      const safeProgress = Math.max(
        0,
        Math.min(routineContext.targetReps, repCount ?? 0),
      );
      return {
        key: "target",
        label: t("routineRun.chips.target"),
        value: `${safeProgress}/${routineContext.targetReps}`,
      };
    }

    if (typeof repCount === "number") {
      return {
        key: "reps",
        label: t("exercises.native.stats.reps"),
        value: String(repCount),
      };
    }

    return null;
  }, [routineContext, repCount, t]);

  // Hero chips
  const heroChips = useMemo(() => {
    const chips = [];

    if (routineContext?.isActive && routineContext.targetReps > 0) {
      chips.push({
        key: "round",
        label: t("routineRun.chips.round"),
        value: `${routineContext.currentRound}/${routineContext.totalRounds}`,
      });

      chips.push({
        key: "step",
        label: t("routineRun.chips.step"),
        value: `${routineContext.stepIndex + 1}/${routineContext.totalSteps}`,
      });
    }

    return chips;
  }, [routineContext, t]);

  // Routine progress
  const routineProgress = useMemo(() => {
    if (!routineContext?.isActive || routineContext.targetReps <= 0) {
      return null;
    }

    const completed = Math.max(
      0,
      Math.min(routineContext.targetReps, repCount ?? 0),
    );
    const ratio = Math.min(1, completed / routineContext.targetReps);

    return { completed, target: routineContext.targetReps, ratio };
  }, [repCount, routineContext]);

  // Next exercise title
  const nextExerciseTitle = useMemo(() => {
    if (!routineContext?.nextExerciseId) return null;
    const nextKey = EXERCISE_COPY_KEYS[routineContext.nextExerciseId];
    return t(`${nextKey}.title`);
  }, [routineContext?.nextExerciseId, t]);

  // Skip to next exercise (manual)
  const handleSkipExercise = () => {
    if (!routineIsActive || !routineOnComplete) return;
    const currentReps = repCount ?? 0;
    advanceRef.current = true;
    routineOnComplete(currentReps);
  };

  // Finish entire routine (manual)
  const handleFinishRoutine = async () => {
    if (!routineIsActive || !routineContext?.routineId) return;

    // Complete all remaining exercises with 0 reps
    const { activeSession } = useRoutineSessionStore.getState();
    if (activeSession) {
      const remainingSteps =
        activeSession.plan.length - activeSession.currentStepIndex;

      // Complete each remaining step (including current) with 0 reps
      for (let i = 0; i < remainingSteps; i++) {
        const { completeCurrentStep } = useRoutineSessionStore.getState();
        completeCurrentStep({ repsOverride: 0 });
      }
    }

    const { router } = await import("expo-router");
    router.replace("/routine/complete");
  };

  return {
    // Camera state
    showCamera,
    cameraSessionKey,
    cameraWidth,
    cameraHeight,

    // Detection
    messageKey,
    repCount,
    feedback,
    handleLandmark,
    handleSwitchCamera,

    // Header
    headerTitle,
    headerSubtitle,

    // Dimensions
    insets,

    // Theme
    scrimColor,
    overlayBorder,
    overlayHeading,
    overlayMuted,
    cardBackground,
    messageColor,
    accentColor,

    // Chips
    primaryChip,
    heroChips,

    // Progress
    routineProgress,
    nextExerciseTitle,
    hasNextExercise: !!routineContext?.nextExerciseId,
    handleSkipExercise,
    handleFinishRoutine,
  };
};
