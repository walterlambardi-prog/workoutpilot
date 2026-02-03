import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import { useRoutineStep } from "@/app/routine/hooks/useRoutineStep";
import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";

export const useExerciseSession = () => {
  const { exerciseId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();

  // Normalize exerciseId parameter
  const normalizedId = useMemo(() => {
    const value = Array.isArray(exerciseId) ? exerciseId[0] : exerciseId;
    return value ?? null;
  }, [exerciseId]);

  // Get exercise definition
  const exerciseDefinition = normalizedId
    ? EXERCISE_DEFINITION_MAP[normalizedId as ExerciseId]
    : undefined;

  // Get routine step data if this is part of a routine
  const routineStep = useRoutineStep(exerciseDefinition?.id);

  // Get translated exercise title
  const exerciseTitle = exerciseDefinition
    ? t(`${exerciseDefinition.copyKey}.title`)
    : t("exercises.session.fallbackTitle");

  // Update navigation title when exercise title changes
  useEffect(() => {
    navigation.setOptions({ title: exerciseTitle });
  }, [exerciseTitle, navigation]);

  // Redirect to exercises list if no valid exercise
  useEffect(() => {
    if (!exerciseDefinition) {
      router.replace("/exercises");
    }
  }, [exerciseDefinition, router]);

  // Cleanup: end session when unmounting
  useEffect(() => {
    if (!exerciseDefinition) {
      return undefined;
    }

    return () => {
      const store = useExerciseSessionStore.getState();
      if (store.currentSession?.exerciseId === exerciseDefinition.id) {
        store.endSession();
      }
    };
  }, [exerciseDefinition]);

  // Build routine context for the Exercises component
  const routineContext = useMemo(
    () =>
      routineStep.isRoutine &&
      routineStep.targetReps &&
      routineStep.stepIndex !== null
        ? {
            isActive: true,
            routineId: routineStep.routineId,
            targetReps: routineStep.targetReps,
            currentRound: routineStep.currentRound ?? 1,
            totalRounds: routineStep.totalRounds ?? 1,
            stepIndex: routineStep.stepIndex ?? 0,
            totalSteps: routineStep.totalSteps ?? 1,
            nextExerciseId: routineStep.nextExerciseId ?? undefined,
            onProgress: routineStep.onProgress,
            onComplete: routineStep.onComplete,
          }
        : undefined,
    [
      routineStep.currentRound,
      routineStep.isRoutine,
      routineStep.nextExerciseId,
      routineStep.onComplete,
      routineStep.onProgress,
      routineStep.routineId,
      routineStep.stepIndex,
      routineStep.targetReps,
      routineStep.totalRounds,
      routineStep.totalSteps,
    ],
  );

  return {
    exerciseDefinition,
    routineContext,
  };
};
