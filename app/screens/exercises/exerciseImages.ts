import type { ImageSourcePropType } from "react-native";

import { ExerciseId } from "@/constants/exercises";

export const exerciseImages: Record<ExerciseId, ImageSourcePropType> = {
  [ExerciseId.HAMMER_CURLS]: require("@/assets/images/exercises/hammerCurls.png"),
  [ExerciseId.LATERAL_RAISES]: require("@/assets/images/exercises/lateralRaises.png"),
  [ExerciseId.PUSHUPS]: require("@/assets/images/exercises/pushups.png"),
  [ExerciseId.SQUATS]: require("@/assets/images/exercises/squats.png"),
};
