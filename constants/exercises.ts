export enum ExerciseId {
  HAMMER_CURLS = "hammer-curls",
  LATERAL_RAISES = "lateral-raises",
  PUSHUPS = "pushups",
  SQUATS = "squats",
}

export const EXERCISE_COPY_KEYS: Record<ExerciseId, string> = {
  [ExerciseId.HAMMER_CURLS]: "exercises.list.items.hammerCurls",
  [ExerciseId.LATERAL_RAISES]: "exercises.list.items.lateralRaises",
  [ExerciseId.PUSHUPS]: "exercises.list.items.pushups",
  [ExerciseId.SQUATS]: "exercises.list.items.squats",
};
