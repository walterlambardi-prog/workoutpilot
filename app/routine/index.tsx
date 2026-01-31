import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Image,
  Separator,
  Text,
  XStack,
  YStack,
  useMedia,
  useTheme,
} from "tamagui";

import { EXERCISE_DEFINITIONS } from "@/app/exercises/exercises.data";
import type {
  RoutineBuilderScreenProps,
  RoutineExerciseListItem,
} from "@/app/routine/routine.types";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { ALLOWED_EXERCISES } from "@/constants/exercises";
import { Spacing } from "@/constants/theme";
import {
  ROUTINE_DEFAULT_REPS,
  useRoutineBuilderStore,
} from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
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
  const media = useMedia();
  const theme = useTheme();
  const router = useRouter();

  const rounds = useRoutineBuilderStore((state) => state.rounds);
  const exercises = useRoutineBuilderStore((state) => state.exercises);
  const incrementRounds = useRoutineBuilderStore(
    (state) => state.incrementRounds,
  );
  const decrementRounds = useRoutineBuilderStore(
    (state) => state.decrementRounds,
  );
  const incrementReps = useRoutineBuilderStore((state) => state.incrementReps);
  const decrementReps = useRoutineBuilderStore((state) => state.decrementReps);
  const toggleExercise = useRoutineBuilderStore(
    (state) => state.toggleExercise,
  );
  const startRoutineSession = useRoutineSessionStore(
    (state) => state.startSession,
  );

  const exerciseList = useMemo<RoutineExerciseListItem[]>(
    () =>
      EXERCISE_DEFINITIONS.filter(({ id }) =>
        ALLOWED_EXERCISES.includes(id),
      ).map(({ id, copyKey, image }) => ({
        id,
        copyKey,
        image,
        title: t(`${copyKey}.title`),
        description: t(`${copyKey}.description`),
      })),
    [t],
  );
  const selectedCount = useMemo(
    () =>
      exerciseList.reduce((count, item) => {
        const config = exercises[item.id];
        return config?.isSelected === false ? count : count + 1;
      }, 0),
    [exerciseList, exercises],
  );

  const hasReadyExercises = useMemo(
    () =>
      exerciseList.some(({ id }) => {
        const config = exercises[id];
        const isSelected = config?.isSelected !== false;
        const reps = config?.reps ?? ROUTINE_DEFAULT_REPS;
        return isSelected && reps > 0;
      }),
    [exerciseList, exercises],
  );

  const titleSize = media.md ? "$6" : "$5";
  const bodySize = media.md ? "$4" : "$3";
  const metaSize = media.md ? "$3" : "$2";

  const resolveToken = useCallback(
    (token?: string) => {
      if (!token) return undefined;
      const key = token.startsWith("$") ? token.slice(1) : token;
      const value = (theme as Record<string, unknown>)[key];
      if (value && typeof value === "object" && "val" in (value as object)) {
        return (value as { val?: string }).val;
      }
      if (typeof value === "string") return value;
      return undefined;
    },
    [theme],
  );

  const withAlpha = useCallback((color?: string, alpha = "55") => {
    if (!color) return undefined;
    if (/^#([0-9a-fA-F]{6})$/.test(color)) {
      return `${color}${alpha}`;
    }
    return color;
  }, []);

  const iconPrimary = resolveToken("$color") ?? "#0F172A";
  const iconOnPrimary = resolveToken("$background") ?? "#F8FAFC";
  const selectedBorderColor = withAlpha(resolveToken("$color"));

  const createDecrementHandler = useCallback(
    (exerciseId: string) => () => decrementReps(exerciseId as any),
    [decrementReps],
  );

  const createIncrementHandler = useCallback(
    (exerciseId: string) => () => incrementReps(exerciseId as any),
    [incrementReps],
  );

  const createToggleHandler = useCallback(
    (exerciseId: string) => () => toggleExercise(exerciseId as any),
    [toggleExercise],
  );

  const handleStartRoutine = useCallback(() => {
    if (!hasReadyExercises) {
      return;
    }

    const selectedExercises = EXERCISE_DEFINITIONS.filter(
      ({ id }) => ALLOWED_EXERCISES.includes(id) && exercises[id]?.isSelected,
    );

    if (selectedExercises.length === 0) {
      return;
    }

    const plan = Array.from({ length: rounds }).flatMap((_, roundIndex) =>
      selectedExercises.map(({ id }) => ({
        exerciseId: id,
        targetReps: exercises[id]?.reps ?? ROUTINE_DEFAULT_REPS,
        round: roundIndex + 1,
      })),
    );

    const sessionId = startRoutineSession(plan, rounds);
    const firstStep = plan[0];

    if (!sessionId || !firstStep) {
      return;
    }

    router.push({
      pathname: "/exercises/[exerciseId]",
      params: {
        exerciseId: firstStep.exerciseId,
        routineId: sessionId,
        stepIndex: "0",
      },
    });
  }, [exercises, hasReadyExercises, rounds, startRoutineSession, router]);

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
              const cardBackground = config.isSelected
                ? "$background"
                : "$backgroundHover";
              const cardBorderColorToken = config.isSelected
                ? "$color"
                : "$borderColor";
              const overlayOpacity = config.isSelected ? 0.08 : 0.2;
              const toggleBg = config.isSelected
                ? "$color"
                : "$backgroundHover";
              const toggleText = config.isSelected ? "$background" : "$color";

              const handleDecrement = createDecrementHandler(item.id);
              const handleIncrement = createIncrementHandler(item.id);
              const handleToggle = createToggleHandler(item.id);

              return (
                <Card
                  key={item.id}
                  bordered
                  elevate={false}
                  opacity={isDisabled ? 0.65 : 1}
                  backgroundColor={cardBackground}
                  padding={media.md ? "$4" : "$3"}
                  borderColor={cardBorderColorToken}
                  borderWidth={1}
                  style={
                    config.isSelected && selectedBorderColor
                      ? { borderColor: selectedBorderColor }
                      : undefined
                  }
                >
                  <YStack gap="$3">
                    <YStack position="relative">
                      <Image
                        source={item.image}
                        resizeMode="cover"
                        style={styles.coverImage}
                        accessibilityElementsHidden
                        accessibilityIgnoresInvertColors
                      />
                      <YStack
                        position="absolute"
                        top={0}
                        right={0}
                        bottom={0}
                        left={0}
                        backgroundColor="$background"
                        opacity={overlayOpacity}
                        borderRadius={Spacing.lg}
                        pointerEvents="none"
                      />
                    </YStack>
                    <YStack gap="$2">
                      <Text
                        fontSize={titleSize}
                        fontWeight="700"
                        color="$color"
                      >
                        {item.title}
                      </Text>
                      <Text fontSize={bodySize} color="$color" opacity={0.9}>
                        {item.description}
                      </Text>
                    </YStack>

                    <XStack
                      alignItems="center"
                      justifyContent="space-between"
                      gap="$3"
                    >
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
                          fontSize={bodySize}
                          fontWeight="700"
                          color="$color"
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

                      <Button
                        onPress={handleToggle}
                        size="$3"
                        backgroundColor={toggleBg}
                        borderColor={cardBorderColorToken}
                        style={
                          config.isSelected && selectedBorderColor
                            ? { borderColor: selectedBorderColor }
                            : undefined
                        }
                        borderWidth={1}
                        color={toggleText}
                        accessibilityRole="switch"
                        aria-checked={config.isSelected}
                        aria-label={t("routineBuilder.exercises.toggleA11y", {
                          exercise: item.title,
                        })}
                        icon={
                          <Ionicons
                            name={
                              config.isSelected
                                ? "checkmark-circle"
                                : "add-circle"
                            }
                            size={18}
                            color={
                              config.isSelected ? iconOnPrimary : iconPrimary
                            }
                          />
                        }
                      >
                        {config.isSelected
                          ? t("routineBuilder.exercises.buttonSelected")
                          : t("routineBuilder.exercises.buttonAdd")}
                      </Button>
                    </XStack>
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
