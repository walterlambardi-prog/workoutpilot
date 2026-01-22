export enum ExerciseId {
  HAMMER_CURLS = "hammer-curls",
  LATERAL_RAISES = "lateral-raises",
  CALF_RAISES = "calf-raises",
  LUNGES = "lunges",
  PUSHUPS = "pushups",
  SQUATS = "squats",
}

export const EXERCISE_COPY_KEYS: Record<ExerciseId, string> = {
  [ExerciseId.HAMMER_CURLS]: "exercises.list.items.hammerCurls",
  [ExerciseId.LATERAL_RAISES]: "exercises.list.items.lateralRaises",
  [ExerciseId.CALF_RAISES]: "exercises.list.items.calfRaises",
  [ExerciseId.LUNGES]: "exercises.list.items.lunges",
  [ExerciseId.PUSHUPS]: "exercises.list.items.pushups",
  [ExerciseId.SQUATS]: "exercises.list.items.squats",
};
