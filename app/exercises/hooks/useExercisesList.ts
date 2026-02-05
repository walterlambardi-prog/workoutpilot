import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { ALLOWED_EXERCISES, ExerciseId } from "@/constants/exercises";

import { EXERCISE_DEFINITIONS } from "../exercises.data";
import type { ExerciseListItem } from "../exercises.types";

export const useExercisesList = () => {
  const { t } = useTranslation();
  const router = useRouter();

  // Build exercise list with translations
  const exercises = useMemo<ExerciseListItem[]>(
    () =>
      EXERCISE_DEFINITIONS.filter(({ id }) =>
        ALLOWED_EXERCISES.includes(id),
      ).map(({ id, copyKey, image }) => ({
        id,
        copyKey,
        image,
        title: t(`${copyKey}.title`),
        description: t(`${copyKey}.description`),
      })),
    [t],
  );

  // Handle exercise card press
  const handlePress = useCallback(
    (exerciseId: ExerciseId) => {
      if (exerciseId === ExerciseId.STEP_TRACKER) {
        router.push("/exercises/stepTracker");
        return;
      }

      router.push({
        pathname: "/exercises/[exerciseId]",
        params: { exerciseId },
      });
    },
    [router],
  );

  // Handle view exercise details
  const handleViewDetails = useCallback(
    (exerciseId: ExerciseId) => {
      router.push({
        pathname: "/exercises/detail/[exerciseId]",
        params: { exerciseId },
      });
    },
    [router],
  );

  return {
    exercises,
    handlePress,
    handleViewDetails,
  };
};
