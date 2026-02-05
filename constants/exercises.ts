export enum ExerciseId {
  ALTERNATING_KNEE_RAISES = "alternating-knee-raises",
  HAMMER_CURLS = "hammer-curls",
  LATERAL_RAISES = "lateral-raises",
  CALF_RAISES = "calf-raises",
  LUNGES = "lunges",
  PUSHUPS = "pushups",
  SQUATS = "squats",
  STANDING_LEG_RAISES = "standing-leg-raises",
  STEP_TRACKER = "stepTracker",
}

export const EXERCISE_COPY_KEYS: Record<ExerciseId, string> = {
  [ExerciseId.ALTERNATING_KNEE_RAISES]:
    "exercises.list.items.alternatingKneeRaises",
  [ExerciseId.HAMMER_CURLS]: "exercises.list.items.hammerCurls",
  [ExerciseId.LATERAL_RAISES]: "exercises.list.items.lateralRaises",
  [ExerciseId.CALF_RAISES]: "exercises.list.items.calfRaises",
  [ExerciseId.LUNGES]: "exercises.list.items.lunges",
  [ExerciseId.PUSHUPS]: "exercises.list.items.pushups",
  [ExerciseId.SQUATS]: "exercises.list.items.squats",
  [ExerciseId.STANDING_LEG_RAISES]: "exercises.list.items.standingLegRaises",
  [ExerciseId.STEP_TRACKER]: "exercises.list.items.stepTracker",
};

export const ALLOWED_EXERCISES: ExerciseId[] = [
  ExerciseId.ALTERNATING_KNEE_RAISES,
  ExerciseId.SQUATS,
  ExerciseId.HAMMER_CURLS,
  ExerciseId.LATERAL_RAISES,
  ExerciseId.CALF_RAISES,
  ExerciseId.STANDING_LEG_RAISES,
  ExerciseId.STEP_TRACKER,
  ExerciseId.PUSHUPS,
  ExerciseId.LUNGES,
];

export const ROUTINE_ALLOWED_EXERCISES: ExerciseId[] = [
  ExerciseId.ALTERNATING_KNEE_RAISES,
  ExerciseId.SQUATS,
  ExerciseId.HAMMER_CURLS,
  ExerciseId.LATERAL_RAISES,
  ExerciseId.CALF_RAISES,
  ExerciseId.STANDING_LEG_RAISES,
  ExerciseId.PUSHUPS,
  ExerciseId.LUNGES,
];
