export enum ExerciseId {
  HAMMER_CURLS = "hammer-curls",
  LATERAL_RAISES = "lateral-raises",
  CALF_RAISES = "calf-raises",
  LUNGES = "lunges",
  PUSHUPS = "pushups",
  SQUATS = "squats",
  STANDING_LEG_RAISES = "standing-leg-raises",
  WALKING = "walking",
}

export const EXERCISE_COPY_KEYS: Record<ExerciseId, string> = {
  [ExerciseId.HAMMER_CURLS]: "exercises.list.items.hammerCurls",
  [ExerciseId.LATERAL_RAISES]: "exercises.list.items.lateralRaises",
  [ExerciseId.CALF_RAISES]: "exercises.list.items.calfRaises",
  [ExerciseId.LUNGES]: "exercises.list.items.lunges",
  [ExerciseId.PUSHUPS]: "exercises.list.items.pushups",
  [ExerciseId.SQUATS]: "exercises.list.items.squats",
  [ExerciseId.STANDING_LEG_RAISES]: "exercises.list.items.standingLegRaises",
  [ExerciseId.WALKING]: "exercises.list.items.walking",
};

export const ALLOWED_EXERCISES: ExerciseId[] = [
  ExerciseId.SQUATS,
  ExerciseId.HAMMER_CURLS,
  ExerciseId.LATERAL_RAISES,
  ExerciseId.CALF_RAISES,
  ExerciseId.STANDING_LEG_RAISES,
  ExerciseId.WALKING,
];

export const ROUTINE_ALLOWED_EXERCISES: ExerciseId[] = [
  ExerciseId.SQUATS,
  ExerciseId.HAMMER_CURLS,
  ExerciseId.LATERAL_RAISES,
  ExerciseId.CALF_RAISES,
  ExerciseId.STANDING_LEG_RAISES,
  ExerciseId.WALKING,
  ExerciseId.LUNGES,
  ExerciseId.PUSHUPS,
];
