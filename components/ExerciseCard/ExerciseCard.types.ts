import type { ImageSourcePropType } from "react-native";

export interface ExerciseCardProps {
  title: string;
  description: string;
  image: ImageSourcePropType;
  accessibilityHint: string;
  onPress: () => void;
}
