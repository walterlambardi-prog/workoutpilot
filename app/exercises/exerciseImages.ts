import type { ImageSourcePropType } from "react-native";

import { ExerciseId } from "@/constants/exercises";

export const exerciseImages: Record<ExerciseId, ImageSourcePropType> = {
  [ExerciseId.ALTERNATING_KNEE_RAISES]: require("@/assets/images/exercises/woman-highknees-real.png"),
  [ExerciseId.HAMMER_CURLS]: require("@/assets/images/exercises/man-hammercurls-real.png"),
  [ExerciseId.LATERAL_RAISES]: require("@/assets/images/exercises/woman-lateral-raises-real.png"),
  [ExerciseId.CALF_RAISES]: require("@/assets/images/exercises/woman-calf-raises-real.png"),
  [ExerciseId.LUNGES]: require("@/assets/images/exercises/man-lunges-real.png"),
  [ExerciseId.PUSHUPS]: require("@/assets/images/exercises/man-pushups-real.png"),
  [ExerciseId.SQUATS]: require("@/assets/images/exercises/woman-squats-real.png"),
  [ExerciseId.STANDING_CHEST_FLY]: require("@/assets/images/exercises/man-standing-chest-fly-real.png"),
  [ExerciseId.STANDING_LEG_RAISES]: require("@/assets/images/exercises/woman-standing-leg-raises-real.png"),
  [ExerciseId.STEP_TRACKER]: require("@/assets/images/exercises/woman-walking-real.png"),
};
