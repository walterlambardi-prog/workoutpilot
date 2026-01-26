import type { Ionicons } from "@expo/vector-icons";

export interface OnboardingStep {
  id: number;
  title: string;
  subtitle: string;
  description: string;
  imageKey: string;
  iconName: keyof typeof Ionicons.glyphMap;
  color: string;
}

export type OnboardingScreenProps = Record<string, never>;
