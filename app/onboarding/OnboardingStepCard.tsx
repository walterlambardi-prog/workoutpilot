import React from "react";
import { View, useWindowDimensions } from "react-native";

import { ThemedText } from "@/components/ThemedText";

import styles from "./onboarding.styles";
import type { OnboardingStep } from "./onboarding.types";

interface OnboardingStepCardProps {
  step: OnboardingStep;
}

/**
 * Individual onboarding step card component
 * Displays icon, title, subtitle, and description
 */
export const OnboardingStepCard: React.FC<OnboardingStepCardProps> = ({
  step,
}) => {
  const { width } = useWindowDimensions();

  return (
    <View style={[styles.stepContainer, { width }]}>
      <View style={styles.content}>
        <View style={styles.imageContainer}>
          <View style={styles.imagePlaceholder}>
            <ThemedText style={styles.placeholderIcon}>
              {step.id === 1 ? "📸" : step.id === 2 ? "💪" : "📊"}
            </ThemedText>
          </View>
        </View>

        <View style={styles.textContent}>
          <ThemedText style={styles.title} type="title">
            {step.title}
          </ThemedText>
          <ThemedText style={styles.subtitle} type="subtitle">
            {step.subtitle}
          </ThemedText>
          <ThemedText style={styles.description}>{step.description}</ThemedText>
        </View>
      </View>
    </View>
  );
};
