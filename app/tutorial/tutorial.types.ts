import type { ImageSourcePropType } from "react-native";

export interface TutorialItem {
  id: string;
  titleKey: string;
  descriptionKey: string;
  image: ImageSourcePropType;
  route: string;
}

export type TutorialScreenProps = Record<string, never>;
