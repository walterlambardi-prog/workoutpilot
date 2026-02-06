import { useRouter } from "expo-router";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useMedia } from "tamagui";

import type { TutorialItem } from "@/app/tutorial/tutorial.types";
import { TUTORIAL_IMAGES } from "@/constants/images";

export const useTutorial = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const media = useMedia();

  const tutorials: TutorialItem[] = [
    {
      id: "poseDetection",
      titleKey: "tutorial.mediapipe.title",
      descriptionKey: "tutorial.mediapipe.description",
      image: TUTORIAL_IMAGES.mediapipe,
      route: "/tutorial/poseDetection",
    },
    {
      id: "exercises",
      titleKey: "tutorial.exercises.title",
      descriptionKey: "tutorial.exercises.description",
      image: TUTORIAL_IMAGES.manHomeMobile,
      route: "/tutorial/exercises",
    },
  ];

  const handleTutorialPress = useCallback(
    (route: string) => {
      router.push(route as any);
    },
    [router],
  );

  const titleSize = media.gtSm ? "$8" : "$7";
  const bodySize = media.gtSm ? "$5" : "$4";

  return {
    tutorials,
    handleTutorialPress,
    titleSize,
    bodySize,
    t,
    media,
  };
};
