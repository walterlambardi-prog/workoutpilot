import type { ImageSourcePropType } from "react-native";

export const BACKGROUND_IMAGES = {
  home: require("@/assets/images/background/home.png"),
  park: require("@/assets/images/background/park.png"),
} satisfies Record<string, ImageSourcePropType>;

export const TUTORIAL_IMAGES = {
  mediapipe: require("@/assets/images/mediapipe/mediapipe.png"),
  exercisesTutorial: require("@/assets/images/tutorial/exercises-tutorial.jpg"),
  manHomeMobile: require("@/assets/images/tutorial/man-home-mobile.png"),
  womanHomeWebcam: require("@/assets/images/tutorial/woman-home-webcam.png"),
} satisfies Record<string, ImageSourcePropType>;

export const EXERCISE_IMAGES = {
  squats: require("@/assets/images/exercises/woman-squats-real.png"),
  pushups: require("@/assets/images/exercises/man-pushups-real.png"),
  lateralRaises: require("@/assets/images/exercises/woman-lateral-raises-real.png"),
  alternatingKneeRaises: require("@/assets/images/exercises/woman-highknees-real.png"),
  hammerCurls: require("@/assets/images/exercises/man-hammercurls-real.png"),
  calfRaises: require("@/assets/images/exercises/woman-calf-raises-real.png"),
  lunges: require("@/assets/images/exercises/man-lunges-real.png"),
  standingChestFly: require("@/assets/images/exercises/man-standing-chest-fly-real.png"),
  standingLegRaises: require("@/assets/images/exercises/woman-standing-leg-raises-real.png"),
} satisfies Record<string, ImageSourcePropType>;
