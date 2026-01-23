import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import { useRoutineStep } from "@/app/routine/useRoutineStep";
import Exercises from "@/components/Exercises";
import { ThemedView } from "@/components/ThemedView";
import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import styles from "./exerciseSession.styles";

const ExerciseSessionScreen: React.FC = () => {
  const { exerciseId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const normalizedId = useMemo(() => {
    const value = Array.isArray(exerciseId) ? exerciseId[0] : exerciseId;
    return value ?? null;
  }, [exerciseId]);

  const exerciseDefinition = normalizedId
    ? EXERCISE_DEFINITION_MAP[normalizedId as ExerciseId]
    : undefined;

  const routineStep = useRoutineStep(exerciseDefinition?.id);

  const exerciseTitle = exerciseDefinition
    ? t(`${exerciseDefinition.copyKey}.title`)
    : t("exercises.session.fallbackTitle");

  useEffect(() => {
    navigation.setOptions({ title: exerciseTitle });
  }, [exerciseTitle, navigation]);

  useEffect(() => {
    if (!exerciseDefinition) {
      router.replace("/exercises");
    }
  }, [exerciseDefinition, router]);

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

  if (!exerciseDefinition) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <Exercises
        exerciseId={exerciseDefinition.id}
        routineContext={routineContext}
      />
    </ThemedView>
  );
};

export default ExerciseSessionScreen;
