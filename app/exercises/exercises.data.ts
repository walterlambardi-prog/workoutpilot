import { EXERCISE_COPY_KEYS, ExerciseId } from "@/constants/exercises";

import { exerciseImages } from "./exerciseImages";
import type { ExerciseDefinition } from "./exercises.types";

export const EXERCISE_DEFINITIONS: ExerciseDefinition[] = [
  {
    id: ExerciseId.ALTERNATING_KNEE_RAISES,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.ALTERNATING_KNEE_RAISES],
    image: exerciseImages[ExerciseId.ALTERNATING_KNEE_RAISES],
  },
  {
    id: ExerciseId.HAMMER_CURLS,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.HAMMER_CURLS],
    image: exerciseImages[ExerciseId.HAMMER_CURLS],
  },
  {
    id: ExerciseId.LATERAL_RAISES,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.LATERAL_RAISES],
    image: exerciseImages[ExerciseId.LATERAL_RAISES],
  },
  {
    id: ExerciseId.CALF_RAISES,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.CALF_RAISES],
    image: exerciseImages[ExerciseId.CALF_RAISES],
  },
  {
    id: ExerciseId.LUNGES,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.LUNGES],
    image: exerciseImages[ExerciseId.LUNGES],
  },
  {
    id: ExerciseId.PUSHUPS,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.PUSHUPS],
    image: exerciseImages[ExerciseId.PUSHUPS],
  },
  {
    id: ExerciseId.SQUATS,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.SQUATS],
    image: exerciseImages[ExerciseId.SQUATS],
  },
  {
    id: ExerciseId.STANDING_CHEST_FLY,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.STANDING_CHEST_FLY],
    image: exerciseImages[ExerciseId.STANDING_CHEST_FLY],
  },
  {
    id: ExerciseId.STANDING_LEG_RAISES,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.STANDING_LEG_RAISES],
    image: exerciseImages[ExerciseId.STANDING_LEG_RAISES],
  },
  {
    id: ExerciseId.STEP_TRACKER,
    copyKey: EXERCISE_COPY_KEYS[ExerciseId.STEP_TRACKER],
    image: exerciseImages[ExerciseId.STEP_TRACKER],
  },
];

export const EXERCISE_DEFINITION_MAP: Record<ExerciseId, ExerciseDefinition> =
  EXERCISE_DEFINITIONS.reduce(
    (acc, exercise) => {
      acc[exercise.id] = exercise;
      return acc;
    },
    {} as Record<ExerciseId, ExerciseDefinition>,
  );
