import type { ImageSourcePropType } from "react-native";

// Centralized shared image assets for reuse across the app
export const BACKGROUND_IMAGES = {
  duration: require("@/assets/images/background/duration.png"),
} satisfies Record<string, ImageSourcePropType>;
