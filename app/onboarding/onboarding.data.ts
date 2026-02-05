import type { OnboardingStep } from "./onboarding.types";

interface OnboardingColors {
  blue: string;
  purple: string;
  green: string;
  orange: string;
  cyan: string;
}

/**
 * Onboarding steps data
 * Images can be added to assets/images/ and referenced here
 */
export const getOnboardingSteps = (
  t: (key: string) => string,
  colors: OnboardingColors,
): OnboardingStep[] => [
  {
    id: 1,
    title: t("onboarding.step1.title"),
    subtitle: t("onboarding.step1.subtitle"),
    description: t("onboarding.step1.description"),
    imageKey: "step1",
    iconName: "camera-outline",
    color: colors.blue,
  },
  {
    id: 2,
    title: t("onboarding.step2.title"),
    subtitle: t("onboarding.step2.subtitle"),
    description: t("onboarding.step2.description"),
    imageKey: "step2",
    iconName: "repeat-outline",
    color: colors.purple,
  },
  {
    id: 3,
    title: t("onboarding.step3.title"),
    subtitle: t("onboarding.step3.subtitle"),
    description: t("onboarding.step3.description"),
    imageKey: "step3",
    iconName: "stats-chart-outline",
    color: colors.green,
  },
  {
    id: 4,
    title: t("onboarding.step4.title"),
    subtitle: t("onboarding.step4.subtitle"),
    description: t("onboarding.step4.description"),
    imageKey: "step4",
    iconName: "barbell-outline",
    color: colors.orange,
  },
  {
    id: 5,
    title: t("onboarding.step5.title"),
    subtitle: t("onboarding.step5.subtitle"),
    description: t("onboarding.step5.description"),
    imageKey: "step5",
    iconName: "chatbubble-ellipses-outline",
    color: colors.cyan,
  },
];
