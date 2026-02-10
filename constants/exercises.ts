export enum ExerciseId {
  ALTERNATING_KNEE_RAISES = "alternating-knee-raises",
  HAMMER_CURLS = "hammer-curls",
  LATERAL_RAISES = "lateral-raises",
  CALF_RAISES = "calf-raises",
  LUNGES = "lunges",
  PUSHUPS = "pushups",
  SQUATS = "squats",
  STANDING_CHEST_FLY = "standing-chest-fly",
  STANDING_LEG_RAISES = "standing-leg-raises",
  STEP_TRACKER = "stepTracker",
}

export enum ExerciseCategory {
  LEGS = "legs",
  ARMS = "arms",
  CHEST = "chest",
  CORE = "core",
  CARDIO = "cardio",
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
  [ExerciseId.STANDING_CHEST_FLY]: "exercises.list.items.standingChestFly",
  [ExerciseId.STANDING_LEG_RAISES]: "exercises.list.items.standingLegRaises",
  [ExerciseId.STEP_TRACKER]: "exercises.list.items.stepTracker",
};

export const EXERCISE_CATEGORIES: Record<ExerciseId, ExerciseCategory> = {
  [ExerciseId.SQUATS]: ExerciseCategory.LEGS,
  [ExerciseId.LUNGES]: ExerciseCategory.LEGS,
  [ExerciseId.CALF_RAISES]: ExerciseCategory.LEGS,
  [ExerciseId.STANDING_LEG_RAISES]: ExerciseCategory.LEGS,
  [ExerciseId.HAMMER_CURLS]: ExerciseCategory.ARMS,
  [ExerciseId.LATERAL_RAISES]: ExerciseCategory.ARMS,
  [ExerciseId.PUSHUPS]: ExerciseCategory.CHEST,
  [ExerciseId.STANDING_CHEST_FLY]: ExerciseCategory.CHEST,
  [ExerciseId.ALTERNATING_KNEE_RAISES]: ExerciseCategory.LEGS,
  [ExerciseId.STEP_TRACKER]: ExerciseCategory.CARDIO,
};

export const CATEGORY_ORDER: ExerciseCategory[] = [
  ExerciseCategory.ARMS,
  ExerciseCategory.CHEST,
  ExerciseCategory.LEGS,
  ExerciseCategory.CORE,
  ExerciseCategory.CARDIO,
];

export const CATEGORY_ICONS: Record<ExerciseCategory, string> = {
  [ExerciseCategory.LEGS]: "footsteps-outline",
  [ExerciseCategory.ARMS]: "barbell-outline",
  [ExerciseCategory.CHEST]: "fitness-outline",
  [ExerciseCategory.CORE]: "body-outline",
  [ExerciseCategory.CARDIO]: "pulse-outline",
};

export const ALLOWED_EXERCISES: ExerciseId[] = [
  ExerciseId.ALTERNATING_KNEE_RAISES,
  ExerciseId.SQUATS,
  ExerciseId.HAMMER_CURLS,
  ExerciseId.LATERAL_RAISES,
  ExerciseId.CALF_RAISES,
  ExerciseId.STANDING_CHEST_FLY,
  ExerciseId.STANDING_LEG_RAISES,
  ExerciseId.STEP_TRACKER,
  ExerciseId.PUSHUPS,
  ExerciseId.LUNGES,
];

// Ordered by category: Legs → Arms → Chest → Core
export const ROUTINE_ALLOWED_EXERCISES: ExerciseId[] = [
  // Legs
  ExerciseId.SQUATS,
  ExerciseId.LUNGES,
  ExerciseId.CALF_RAISES,
  ExerciseId.STANDING_LEG_RAISES,
  // Arms
  ExerciseId.HAMMER_CURLS,
  ExerciseId.LATERAL_RAISES,
  // Chest
  ExerciseId.PUSHUPS,
  ExerciseId.STANDING_CHEST_FLY,
  // Core
  ExerciseId.ALTERNATING_KNEE_RAISES,
];
