import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  type ListRenderItem,
  Pressable,
  Text,
  useWindowDimensions,
  View,
  type ViewToken,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ScreenHeader from "@/components/ScreenHeader";
import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/authStore";

import { getOnboardingSteps } from "./onboarding.data";
import styles from "./onboarding.styles";
import type { OnboardingStep } from "./onboarding.types";
import { OnboardingStepCard } from "./OnboardingStepCard";

/**
 * Onboarding screen - shows app features and benefits
 * Displayed after login if not completed before
 */
const OnboardingScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef<FlatList<OnboardingStep>>(null);
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const setHasCompletedOnboarding = useAuthStore(
    (state: { setHasCompletedOnboarding: (completed: boolean) => void }) =>
      state.setHasCompletedOnboarding,
  );
  const backgroundColor = useThemeColor({}, "background");
  const tintColor = useThemeColor({}, "tint");
  const buttonPrimaryBg = useThemeColor(
    { light: "#0a7ea4", dark: "#0a7ea4" },
    "tint",
  );
  const steps = getOnboardingSteps(t);

  const onViewableItemsChanged = useRef(
    ({
      viewableItems,
    }: {
      viewableItems: ViewToken<OnboardingStep>[];
      changed: ViewToken<OnboardingStep>[];
    }) => {
      if (viewableItems.length > 0 && viewableItems[0].index !== null) {
        setCurrentIndex(viewableItems[0].index);
      }
    },
  ).current;

  const viewabilityConfig = useRef({
    itemVisiblePercentThreshold: 50,
  }).current;

  const handleNext = () => {
    if (currentIndex < steps.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      flatListRef.current?.scrollToOffset({
        offset: nextIndex * width,
        animated: true,
      });
    } else {
      handleComplete();
    }
  };

  const handleSkip = () => {
    handleComplete();
  };

  const handleComplete = () => {
    setHasCompletedOnboarding(true);
    router.replace("/");
  };

  const renderStep: ListRenderItem<OnboardingStep> = ({ item }) => (
    <OnboardingStepCard step={item} />
  );

  const isLastStep = currentIndex === steps.length - 1;

  return (
    <View
      style={[styles.container, { backgroundColor, paddingTop: insets.top }]}
    >
      <View style={styles.header}>
        <ScreenHeader
          title={t("onboarding.title")}
          subtitle={t("onboarding.subtitle")}
          align="center"
        />
      </View>

      <FlatList
        ref={flatListRef}
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        scrollEventThrottle={16}
        bounces={false}
      />

      <View style={styles.bottomControls}>
        <View style={styles.pagination}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                index === currentIndex && styles.dotActive,
                index === currentIndex && { backgroundColor: tintColor },
              ]}
            />
          ))}
        </View>

        <View style={styles.buttonsRow}>
          <Pressable
            onPress={handleSkip}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              { borderColor: tintColor },
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("onboarding.skip")}
          >
            <ThemedText
              style={[
                styles.buttonText,
                styles.buttonTextSecondary,
                { color: tintColor },
              ]}
            >
              {t("onboarding.skip")}
            </ThemedText>
          </Pressable>

          <Pressable
            onPress={handleNext}
            style={({ pressed }) => [
              styles.button,
              styles.buttonPrimary,
              { backgroundColor: buttonPrimaryBg },
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={
              isLastStep ? t("onboarding.getStarted") : t("onboarding.next")
            }
          >
            <Text style={[styles.buttonText, styles.buttonTextPrimary]}>
              {isLastStep ? t("onboarding.getStarted") : t("onboarding.next")}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

export default OnboardingScreen;
