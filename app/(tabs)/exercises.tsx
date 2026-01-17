import { Platform } from "react-native";

import ExercisesNative from "./exercises.native";
import ExercisesWeb from "./exercises.web";

// Fallback file so Expo Router always has a base route; selects per platform.
export default Platform.OS === "web" ? ExercisesWeb : ExercisesNative;
