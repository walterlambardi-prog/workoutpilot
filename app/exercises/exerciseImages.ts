import type { ImageSourcePropType } from "react-native";

import { ExerciseId } from "@/constants/exercises";

export const exerciseImages: Record<ExerciseId, ImageSourcePropType> = {
  [ExerciseId.HAMMER_CURLS]: require("@/assets/images/exercises/hammerCurls.png"),
  [ExerciseId.LATERAL_RAISES]: require("@/assets/images/exercises/lateralRaises.png"),
  [ExerciseId.CALF_RAISES]: require("@/assets/images/exercises/calfRaises.png"),
  [ExerciseId.LUNGES]: require("@/assets/images/exercises/lunges.png"),
  [ExerciseId.PUSHUPS]: require("@/assets/images/exercises/pushups.png"),
  [ExerciseId.SQUATS]: require("@/assets/images/exercises/squats.png"),
  [ExerciseId.STANDING_LEG_RAISES]: require("@/assets/images/exercises/standingLegRaises.png"),
  [ExerciseId.STEP_TRACKER]: require("@/assets/images/exercises/stepTracker.png"),
};
