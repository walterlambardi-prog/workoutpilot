import { Dimensions } from "react-native";

const { width } = Dimensions.get("window");

// Camera dimensions
export const CAMERA_WIDTH = width - 32;
export const CAMERA_HEIGHT = (CAMERA_WIDTH * 4) / 3;

// MediaPipe pose connections (subset for visualization)
export const POSE_CONNECTIONS: [number, number][] = [
  [11, 13],
  [13, 15], // Left arm
  [12, 14],
  [14, 16], // Right arm
  [11, 12], // Shoulders
  [11, 23],
  [12, 24], // Torso
  [23, 24],
  [23, 25],
  [25, 27], // Left leg
  [24, 26],
  [26, 28], // Right leg
];

// Model URLs for web (respect Expo public path for GitHub Pages hosting)
const PUBLIC_PATH = (() => {
  const path = process.env.EXPO_PUBLIC_PATH ?? "/";
  const withTrailing = path.endsWith("/") ? path : `${path}/`;
  return withTrailing.startsWith("/") ? withTrailing : `/${withTrailing}`;
})();

export const POSE_MODEL_URL = `${PUBLIC_PATH}models/pose_landmarker_full.task`;
export const WASM_BASE_URL = `${PUBLIC_PATH}mediapipe`;

// MediaPipe configuration
export const MEDIAPIPE_CONFIG = {
  runningMode: "VIDEO" as const,
  numPoses: 1,
};
