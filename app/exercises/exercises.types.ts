import type { ImageSourcePropType } from "react-native";

import { ExerciseId } from "@/constants/exercises";

export interface ExerciseDefinition {
  id: ExerciseId;
  copyKey: string;
  image: ImageSourcePropType;
}

export interface ExerciseListItem extends ExerciseDefinition {
  title: string;
  description: string;
}

export type ExercisesScreenProps = Record<string, never>;
