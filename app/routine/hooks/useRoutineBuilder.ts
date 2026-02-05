import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { FontSizeTokens } from "tamagui";
import { useMedia, useTheme } from "tamagui";

import { EXERCISE_DEFINITIONS } from "@/app/exercises/exercises.data";
import type { RoutineExerciseListItem } from "@/app/routine/routine.types";
import { ROUTINE_ALLOWED_EXERCISES } from "@/constants/exercises";
import {
  ROUTINE_DEFAULT_REPS,
  useRoutineBuilderStore,
} from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

export const useRoutineBuilder = () => {
  const { t } = useTranslation();
  const media = useMedia();
  const theme = useTheme();
  const router = useRouter();

  const rounds = useRoutineBuilderStore((state) => state.rounds);
  const exercises = useRoutineBuilderStore((state) => state.exercises);
  const incrementRounds = useRoutineBuilderStore(
    (state) => state.incrementRounds,
  );
  const decrementRounds = useRoutineBuilderStore(
    (state) => state.decrementRounds,
  );
  const incrementReps = useRoutineBuilderStore((state) => state.incrementReps);
  const decrementReps = useRoutineBuilderStore((state) => state.decrementReps);
  const toggleExercise = useRoutineBuilderStore(
    (state) => state.toggleExercise,
  );
  const startRoutineSession = useRoutineSessionStore(
    (state) => state.startSession,
  );

  const exerciseList = useMemo<RoutineExerciseListItem[]>(
    () =>
      EXERCISE_DEFINITIONS.filter(({ id }) =>
        ROUTINE_ALLOWED_EXERCISES.includes(id),
      ).map(({ id, copyKey, image }) => ({
        id,
        copyKey,
        image,
        title: t(`${copyKey}.title`),
        description: t(`${copyKey}.description`),
      })),
    [t],
  );

  const selectedCount = useMemo(
    () =>
      exerciseList.reduce((count, item) => {
        const config = exercises[item.id];
        return config?.isSelected === false ? count : count + 1;
      }, 0),
    [exerciseList, exercises],
  );

  const hasReadyExercises = useMemo(
    () =>
      exerciseList.some(({ id }) => {
        const config = exercises[id];
        const isSelected = config?.isSelected !== false;
        const reps = config?.reps ?? ROUTINE_DEFAULT_REPS;
        return isSelected && reps > 0;
      }),
    [exerciseList, exercises],
  );

  const titleSize: FontSizeTokens = "$5";
  const bodySize: FontSizeTokens = "$3";
  const metaSize: FontSizeTokens = "$3";

  const resolveToken = useCallback(
    (token?: string) => {
      if (!token) return undefined;
      const key = token.startsWith("$") ? token.slice(1) : token;
      const value = (theme as Record<string, unknown>)[key];
      if (value && typeof value === "object" && "val" in (value as object)) {
        return (value as { val?: string }).val;
      }
      if (typeof value === "string") return value;
      return undefined;
    },
    [theme],
  );

  const withAlpha = useCallback((color?: string, alpha = "55") => {
    if (!color) return undefined;
    if (/^#([0-9a-fA-F]{6})$/.test(color)) {
      return `${color}${alpha}`;
    }
    return color;
  }, []);

  const iconPrimary = resolveToken("$color") ?? "#0F172A";
  const selectedBorderColor = withAlpha(resolveToken("$color"));

  const createDecrementHandler = useCallback(
    (exerciseId: string) => () => decrementReps(exerciseId as any),
    [decrementReps],
  );

  const createIncrementHandler = useCallback(
    (exerciseId: string) => () => incrementReps(exerciseId as any),
    [incrementReps],
  );

  const createToggleHandler = useCallback(
    (exerciseId: string) => () => toggleExercise(exerciseId as any),
    [toggleExercise],
  );

  const handleStartRoutine = useCallback(() => {
    if (!hasReadyExercises) {
      return;
    }

    const selectedExercises = EXERCISE_DEFINITIONS.filter(
      ({ id }) =>
        ROUTINE_ALLOWED_EXERCISES.includes(id) && exercises[id]?.isSelected,
    );

    if (selectedExercises.length === 0) {
      return;
    }

    const plan = Array.from({ length: rounds }).flatMap((_, roundIndex) =>
      selectedExercises.map(({ id }) => ({
        exerciseId: id,
        targetReps: exercises[id]?.reps ?? ROUTINE_DEFAULT_REPS,
        round: roundIndex + 1,
      })),
    );

    const sessionId = startRoutineSession(plan, rounds);
    const firstStep = plan[0];

    if (!sessionId || !firstStep) {
      return;
    }

    router.push({
      pathname: "/exercises/[exerciseId]",
      params: {
        exerciseId: firstStep.exerciseId,
        routineId: sessionId,
        stepIndex: "0",
      },
    });
  }, [exercises, hasReadyExercises, rounds, startRoutineSession, router]);

  return {
    // State
    rounds,
    exercises,
    exerciseList,
    selectedCount,
    hasReadyExercises,

    // Responsive sizes
    titleSize,
    bodySize,
    metaSize,

    // Theme
    iconPrimary,
    selectedBorderColor,
    media,

    // Actions
    incrementRounds,
    decrementRounds,
    createDecrementHandler,
    createIncrementHandler,
    createToggleHandler,
    handleStartRoutine,
  };
};
