import type { OnboardingStep } from "./onboarding.types";

/**
 * Onboarding steps data
 * Images can be added to assets/images/ and referenced here
 */
export const getOnboardingSteps = (
  t: (key: string) => string,
): OnboardingStep[] => [
  {
    id: 1,
    title: t("onboarding.step1.title"),
    subtitle: t("onboarding.step1.subtitle"),
    description: t("onboarding.step1.description"),
    imageKey: "step1",
  },
  {
    id: 2,
    title: t("onboarding.step2.title"),
    subtitle: t("onboarding.step2.subtitle"),
    description: t("onboarding.step2.description"),
    imageKey: "step2",
  },
  {
    id: 3,
    title: t("onboarding.step3.title"),
    subtitle: t("onboarding.step3.subtitle"),
    description: t("onboarding.step3.description"),
    imageKey: "step3",
  },
];
