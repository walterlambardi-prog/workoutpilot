import type { ImageSourcePropType } from "react-native";

import { ExerciseId } from "@/constants/exercises";

export const exerciseImages: Record<ExerciseId, ImageSourcePropType> = {
  // [ExerciseId.HAMMER_CURLS]: require("@/assets/images/exercises/hammerCurls.png"),
  // [ExerciseId.LATERAL_RAISES]: require("@/assets/images/exercises/lateralRaises.png"),
  // [ExerciseId.CALF_RAISES]: require("@/assets/images/exercises/calfRaises.png"),
  // [ExerciseId.LUNGES]: require("@/assets/images/exercises/lunges.png"),
  // [ExerciseId.PUSHUPS]: require("@/assets/images/exercises/pushups.png"),
  // [ExerciseId.SQUATS]: require("@/assets/images/exercises/squats.png"),
  // [ExerciseId.STANDING_LEG_RAISES]: require("@/assets/images/exercises/standingLegRaises.png"),
  // [ExerciseId.STEP_TRACKER]: require("@/assets/images/exercises/stepTracker.png"),
  [ExerciseId.ALTERNATING_KNEE_RAISES]: require("@/assets/images/exercises/realistic/mujer-elevacion-pierna-alternado-frente-fondo-transparente-png-1.png"),
  [ExerciseId.HAMMER_CURLS]: require("@/assets/images/exercises/realistic/hombre-hammer-curls-alternados-frente-fondo-transparente-png-1.png"),
  [ExerciseId.LATERAL_RAISES]: require("@/assets/images/exercises/realistic/mujer-elevacion-lateral-brazos-fondo-transparente-png-1.png"),
  [ExerciseId.CALF_RAISES]: require("@/assets/images/exercises/realistic/mujer-elevacion-talones-dos-pies-frente-fondo-transparente-png-1.png"),
  [ExerciseId.LUNGES]: require("@/assets/images/exercises/realistic/hombre-zancadas-frente-fondo-transparente-png-1.png"),
  [ExerciseId.PUSHUPS]: require("@/assets/images/exercises/realistic/hombre-flexiones-brazo-frente-fondo-transparente-png-1.png"),
  [ExerciseId.SQUATS]: require("@/assets/images/exercises/realistic/mujer-sentadilla-frente-fondo-transparente-png-1.png"),
  [ExerciseId.STANDING_CHEST_FLY]: require("@/assets/images/exercises/realistic/quitar-fondo-definitivo-solo-persona-alpha-real-1-1-1.png"),
  [ExerciseId.STANDING_LEG_RAISES]: require("@/assets/images/exercises/realistic/mujer-elevacion-lateral-pierna-alternada-ultrafotoreal-pose-referencia-png-transparente-1.png"),
  [ExerciseId.STEP_TRACKER]: require("@/assets/images/exercises/realistic/mujer-caminando-fondo-transparente-png-1.png"),
};
