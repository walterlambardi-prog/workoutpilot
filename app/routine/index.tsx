import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Image, Separator, Text, XStack, YStack } from "tamagui";

import type { RoutineBuilderScreenProps } from "@/app/routine/routine.types";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { Spacing } from "@/constants/theme";
import { ROUTINE_DEFAULT_REPS } from "@/stores/routineBuilderStore";

import { useRoutineBuilder } from "./hooks/useRoutineBuilder";
import { styles } from "./routine.styles";

const StepperButton: React.FC<{
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  iconColor?: string;
}> = ({ icon, onPress, accessibilityLabel, disabled, iconColor }) => (
  <Button
    size="$3"
    circular
    chromeless
    backgroundColor="$backgroundHover"
    borderColor="$borderColor"
    borderWidth={1}
    onPress={onPress}
    disabled={disabled}
    aria-label={accessibilityLabel}
    icon={
      <Ionicons name={icon} size={18} color={iconColor ?? "currentColor"} />
    }
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
    iconPrimary,
    selectedBorderColor,
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
                    iconColor={iconPrimary}
                  />
                  <Text fontSize={titleSize} fontWeight="700" color="$color">
                    {rounds}
                  </Text>
                  <StepperButton
                    icon="add-outline"
                    onPress={incrementRounds}
                    accessibilityLabel={t("routineBuilder.rounds.increment")}
                    iconColor={iconPrimary}
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
          <YStack gap="$1">
            <Text fontSize={titleSize} fontWeight="700" color="$color">
              {t("routineBuilder.exercises.title")}
            </Text>
            <Text fontSize={bodySize} color="$color" opacity={0.7}>
              {t("routineBuilder.exercises.subtitle")}
            </Text>
          </YStack>

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
                  elevate={false}
                  padding={0}
                  overflow="hidden"
                  style={
                    config.isSelected && selectedBorderColor
                      ? { borderColor: selectedBorderColor }
                      : undefined
                  }
                >
                  <YStack position="relative" height={280}>
                    {/* Background Image */}
                    <Image
                      source={item.image}
                      resizeMode="cover"
                      style={styles.backgroundImage}
                      accessibilityElementsHidden
                      accessibilityIgnoresInvertColors
                    />

                    {/* Dark overlay for better text readability */}
                    <YStack
                      position="absolute"
                      top={0}
                      right={0}
                      bottom={0}
                      left={0}
                      backgroundColor="$background"
                      opacity={0.15}
                      pointerEvents="none"
                    />

                    {/* Additional overlay for disabled state */}
                    {isDisabled && (
                      <YStack
                        position="absolute"
                        top={0}
                        right={0}
                        bottom={0}
                        left={0}
                        backgroundColor="rgba(0,0,0,0.45)"
                        pointerEvents="none"
                      />
                    )}

                    {/* Content Layout */}
                    <YStack
                      flex={1}
                      justifyContent="space-between"
                      padding={media.md ? "$4" : "$3"}
                      pointerEvents="box-none"
                    >
                      {/* Header - Title and Description */}
                      <YStack
                        gap="$1"
                        pointerEvents="none"
                        paddingHorizontal="$2"
                      >
                        <Text
                          fontSize={titleSize}
                          fontWeight="700"
                          color="white"
                        >
                          {item.title}
                        </Text>
                        <Text fontSize={bodySize} color="white" opacity={0.95}>
                          {item.description}
                        </Text>
                      </YStack>

                      {/* Footer - Controls */}
                      <XStack
                        alignItems="center"
                        justifyContent="space-between"
                        gap="$2"
                        backgroundColor="$background"
                        opacity={0.85}
                        padding="$3"
                        borderRadius="$4"
                        pointerEvents="box-none"
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
                            iconColor={iconPrimary}
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
                            iconColor={iconPrimary}
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
                          aria-label={t("routineBuilder.exercises.toggleA11y", {
                            exercise: item.title,
                          })}
                        >
                          {config.isSelected
                            ? t("routineBuilder.exercises.buttonSelected")
                            : t("routineBuilder.exercises.buttonAdd")}
                        </TButton>
                      </XStack>
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

export default RoutineBuilderScreen;
