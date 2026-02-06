import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { Image as RNImage, StyleSheet as RNStyleSheet } from "react-native";
import { Card, Separator, Text, XStack, YStack } from "tamagui";

import type { RoutineBuilderScreenProps } from "@/app/routine/routine.types";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { Spacing } from "@/constants/theme";
import { ROUTINE_DEFAULT_REPS } from "@/stores/routineBuilderStore";

import { useRoutineBuilder } from "./hooks/useRoutineBuilder";

// Gradient overlays for card states
const GRADIENT_DESELECTED = [
  "rgba(0, 0, 0, 0.2)", // Lighter black at edges
  "rgba(0, 0, 0, 0.3)", // Very light in center
  "rgba(0, 0, 0, 0.4)", // Lighter black at bottom
] as const;

const GRADIENT_SELECTED = [
  "rgba(0, 0, 0, 0)", // Lighter black at edges
  "rgba(0, 0, 0, 0.1)", // Very light in center
  "rgba(0, 0, 0, 0.4)", // Lighter black at bottom
] as const;

const StepperButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
}> = ({ icon, onPress, accessibilityLabel, disabled }) => (
  <TButton
    size="$3"
    circular
    variant="ghost"
    backgroundColor="$backgroundHover"
    borderColor="$borderColor"
    borderWidth={1}
    onPress={onPress}
    disabled={disabled}
    aria-label={accessibilityLabel}
    iconName={icon}
    iconOnly
  />
);

const RoutineBuilderScreen: React.FC<RoutineBuilderScreenProps> = () => {
  const { t } = useTranslation();

  const {
    rounds,
    exercises,
    exerciseList,
    selectedCount,
    hasReadyExercises,
    titleSize,
    bodySize,
    metaSize,
    media,
    incrementRounds,
    decrementRounds,
    createDecrementHandler,
    createIncrementHandler,
    createToggleHandler,
    handleStartRoutine,
  } = useRoutineBuilder();

  return (
    <TPage hasHeader>
      <YStack gap={Spacing.xxl}>
        <ScreenHeader
          title={t("routineBuilder.title")}
          subtitle={t("routineBuilder.subtitle")}
        />

        <Card
          bordered
          size={media.md ? "$5" : "$4"}
          padding={media.md ? "$5" : "$4"}
          backgroundColor="$backgroundHover"
          overflow="hidden"
          elevate={false}
        >
          <YStack gap="$3">
            <XStack
              alignItems="flex-start"
              justifyContent="space-between"
              gap="$4"
              flexWrap="nowrap"
            >
              <YStack gap="$2" alignItems="center" flex={1}>
                <Text fontSize={metaSize} color="$color" opacity={0.7}>
                  {t("routineBuilder.rounds.label")}
                </Text>
                <XStack alignItems="center" gap="$3">
                  <StepperButton
                    icon="remove-outline"
                    onPress={decrementRounds}
                    accessibilityLabel={t("routineBuilder.rounds.decrement")}
                    disabled={rounds <= 1}
                  />
                  <Text fontSize={titleSize} fontWeight="700" color="$color">
                    {rounds}
                  </Text>
                  <StepperButton
                    icon="add-outline"
                    onPress={incrementRounds}
                    accessibilityLabel={t("routineBuilder.rounds.increment")}
                  />
                </XStack>
              </YStack>

              <Separator alignSelf="stretch" vertical />

              <YStack gap="$2" alignItems="center" flex={1}>
                <Text fontSize={metaSize} color="$color" opacity={0.7}>
                  {t("routineBuilder.exercises.selectedLabel")}
                </Text>
                <Text
                  fontSize={titleSize}
                  fontWeight="700"
                  color="$color"
                  paddingTop={Spacing.xs}
                >
                  {selectedCount}
                </Text>
              </YStack>

              <Separator alignSelf="stretch" vertical />

              <YStack gap="$2" alignItems="center" flex={1}>
                <Text fontSize={metaSize} color="$color" opacity={0.7}>
                  {t("routineBuilder.cta")}
                </Text>
                <TButton
                  onPress={handleStartRoutine}
                  disabled={!hasReadyExercises}
                  aria-label={t("routineBuilder.cta")}
                  iconName="play"
                  iconOnly
                  size="$4"
                />
              </YStack>
            </XStack>
          </YStack>
        </Card>

        <YStack gap={Spacing.md}>
          <TGrid columns={3} gap="$3">
            {exerciseList.map((item) => {
              const config = exercises[item.id] ?? {
                reps: ROUTINE_DEFAULT_REPS,
                isSelected: true,
              };
              const isDisabled = !config.isSelected;

              const handleDecrement = createDecrementHandler(item.id);
              const handleIncrement = createIncrementHandler(item.id);
              const handleToggle = createToggleHandler(item.id);

              return (
                <Card
                  key={item.id}
                  bordered
                  borderColor={config.isSelected ? "$primary" : "$borderColor"}
                  elevate={false}
                  padding={0}
                  overflow="hidden"
                  animation="quick"
                  hoverStyle={{
                    elevation: "$3",
                    scale: 1.01,
                    borderColor: "$primary",
                  }}
                  pressStyle={{
                    scale: 0.99,
                  }}
                  height={380}
                >
                  <YStack position="relative" width="100%" height="100%">
                    {/* Layer 1: Background Image (with conditional opacity) */}
                    <YStack
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      zIndex={1}
                    >
                      <RNImage
                        source={item.image}
                        style={routineCardStyles.image}
                        resizeMode="contain"
                      />
                    </YStack>

                    {/* Layer 2: Gradient Overlay (always full opacity) */}
                    <LinearGradient
                      colors={
                        isDisabled ? GRADIENT_DESELECTED : GRADIENT_SELECTED
                      }
                      style={routineCardStyles.gradient}
                      pointerEvents="none"
                    />

                    {/* Layer 3: Title and Description - Top */}
                    <YStack
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      padding={media.md ? "$4" : "$3"}
                      zIndex={5}
                      pointerEvents="none"
                    >
                      <YStack position="relative">
                        {/* Background layer */}
                        <YStack
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          backgroundColor="$background"
                          opacity={0.75}
                          borderRadius="$4"
                          zIndex={-1}
                        />
                        {/* Content layer */}
                        <YStack gap="$1" padding="$3">
                          <Text
                            fontSize={titleSize}
                            fontWeight="800"
                            color="$color"
                            numberOfLines={2}
                          >
                            {item.title}
                          </Text>
                          <Text
                            fontSize={bodySize}
                            color="$color"
                            opacity={0.95}
                            numberOfLines={2}
                          >
                            {item.description}
                          </Text>
                        </YStack>
                      </YStack>
                    </YStack>

                    {/* Layer 4: Controls - Bottom */}
                    <YStack
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      padding={media.md ? "$4" : "$3"}
                      zIndex={5}
                      pointerEvents="box-none"
                    >
                      <YStack position="relative">
                        {/* Background layer */}
                        <YStack
                          position="absolute"
                          top={0}
                          left={0}
                          right={0}
                          bottom={0}
                          backgroundColor="$background"
                          opacity={0.8}
                          borderRadius="$4"
                          zIndex={-1}
                          pointerEvents="none"
                        />
                        {/* Content layer */}
                        <XStack
                          alignItems="center"
                          justifyContent="space-between"
                          gap="$2"
                          padding="$3"
                          pointerEvents="auto"
                        >
                          {/* Reps Stepper */}
                          <XStack alignItems="center" gap="$2">
                            <StepperButton
                              icon="remove-outline"
                              onPress={handleDecrement}
                              accessibilityLabel={t(
                                "routineBuilder.exercises.decrement",
                                { exercise: item.title },
                              )}
                              disabled={isDisabled || config.reps <= 1}
                            />
                            <Text
                              fontSize={titleSize}
                              fontWeight="700"
                              color="$color"
                              minWidth={40}
                              textAlign="center"
                            >
                              {config.reps}
                            </Text>
                            <StepperButton
                              icon="add-outline"
                              onPress={handleIncrement}
                              accessibilityLabel={t(
                                "routineBuilder.exercises.increment",
                                { exercise: item.title },
                              )}
                              disabled={isDisabled}
                            />
                          </XStack>

                          {/* Add/Remove Button */}
                          <TButton
                            onPress={handleToggle}
                            variant={config.isSelected ? "primary" : "outline"}
                            size="$3"
                            iconName={
                              config.isSelected
                                ? "checkmark-circle"
                                : "add-circle"
                            }
                            accessibilityRole="switch"
                            aria-checked={config.isSelected}
                            aria-label={t(
                              "routineBuilder.exercises.toggleA11y",
                              {
                                exercise: item.title,
                              },
                            )}
                          >
                            {config.isSelected
                              ? t("routineBuilder.exercises.buttonSelected")
                              : t("routineBuilder.exercises.buttonAdd")}
                          </TButton>
                        </XStack>
                      </YStack>
                    </YStack>
                  </YStack>
                </Card>
              );
            })}
          </TGrid>
        </YStack>

        <Separator />

        <TButton onPress={handleStartRoutine} disabled={!hasReadyExercises}>
          {t("routineBuilder.cta")}
        </TButton>
      </YStack>
    </TPage>
  );
};

const routineCardStyles = RNStyleSheet.create({
  image: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 2,
  },
});

export default RoutineBuilderScreen;
