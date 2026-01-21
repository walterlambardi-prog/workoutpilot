import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  ImageBackground,
  Pressable,
  View,
  type ListRenderItemInfo,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EXERCISE_DEFINITIONS } from "@/app/exercises/exercises.data";
import type {
  RoutineBuilderScreenProps,
  RoutineExerciseListItem,
} from "@/app/routine/routine.types";
import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { useColorScheme } from "@/hooks/useColorScheme";
import {
  ROUTINE_DEFAULT_REPS,
  useRoutineBuilderStore,
} from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import styles from "./routine.styles";

interface StepperButtonProps {
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  accessibilityLabel: string;
  disabled?: boolean;
  colorScheme: "light" | "dark";
  variant?: "default" | "compact";
}

const StepperButton: React.FC<StepperButtonProps> = ({
  icon,
  onPress,
  accessibilityLabel,
  disabled,
  colorScheme,
  variant = "default",
}) => (
  <Pressable
    onPress={onPress}
    disabled={disabled}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    style={({ pressed }) => [
      styles.stepperButton,
      variant === "compact" ? styles.stepperButtonCompact : null,
      disabled ? styles.stepperButtonDisabled : null,
      pressed && !disabled ? styles.stepperButtonPressed : null,
    ]}
  >
    <Ionicons
      name={icon}
      size={20}
      color={
        disabled ? "#94A3B8" : colorScheme === "dark" ? "#F8FAFC" : "#111827"
      }
    />
  </Pressable>
);

const TOGGLE_HIT_SLOP = { top: 8, right: 8, bottom: 8, left: 8 } as const;

const RoutineBuilderScreen: React.FC<RoutineBuilderScreenProps> = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const colorScheme = (useColorScheme() ?? "light") as "light" | "dark";
  const router = useRouter();

  const roundsCardTone =
    colorScheme === "dark" ? styles.roundsCardDark : styles.roundsCardLight;
  const exerciseCardTone =
    colorScheme === "dark" ? styles.exerciseCardDark : styles.exerciseCardLight;

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
      EXERCISE_DEFINITIONS.map(({ id, copyKey, image }) => ({
        id,
        copyKey,
        image,
        title: t(`${copyKey}.title`),
        description: t(`${copyKey}.description`),
      })),
    [t],
  );

  const selectedCount = useMemo(
    () => Object.values(exercises).filter((config) => config.isSelected).length,
    [exercises],
  );

  const renderExercise = useCallback(
    ({ item }: ListRenderItemInfo<RoutineExerciseListItem>) => {
      const config = exercises[item.id] ?? {
        reps: ROUTINE_DEFAULT_REPS,
        isSelected: true,
      };
      const toggleIconColor = config.isSelected
        ? colorScheme === "dark"
          ? "#4ADE80"
          : "#15803D"
        : colorScheme === "dark"
          ? "#CBD5F5"
          : "#0F172A";
      const overlayTone =
        colorScheme === "dark"
          ? styles.exerciseOverlayDark
          : styles.exerciseOverlayLight;

      return (
        <ThemedView
          style={[
            styles.exerciseCard,
            exerciseCardTone,
            !config.isSelected ? styles.exerciseCardDisabled : null,
          ]}
        >
          <ImageBackground
            source={item.image}
            style={styles.exerciseBackground}
            imageStyle={styles.exerciseBackgroundImage}
            accessibilityElementsHidden
            accessibilityIgnoresInvertColors
          >
            <View
              pointerEvents="none"
              style={[styles.exerciseOverlay, overlayTone]}
            />
            <View style={styles.exerciseContent} pointerEvents="box-none">
              <View style={styles.exerciseTop}>
                <View style={styles.exerciseHeader}>
                  <View style={styles.exerciseTitleBlock}>
                    <ThemedText
                      type="subtitle"
                      style={styles.exerciseTitle}
                      numberOfLines={2}
                      lightColor="#F8FAFC"
                      darkColor="#F8FAFC"
                    >
                      {item.title}
                    </ThemedText>
                  </View>
                </View>
                <ThemedText
                  style={styles.exerciseDescription}
                  lightColor="#E2E8F0"
                  darkColor="#E2E8F0"
                >
                  {item.description}
                </ThemedText>
              </View>
              <View style={styles.exerciseFooter}>
                <View style={styles.repsColumn}>
                  <View style={styles.repsRow}>
                    <View style={styles.repsStepper}>
                      <StepperButton
                        icon="remove-outline"
                        onPress={() => decrementReps(item.id)}
                        accessibilityLabel={t(
                          "routineBuilder.exercises.decrement",
                          {
                            exercise: item.title,
                          },
                        )}
                        disabled={config.reps <= 1}
                        colorScheme={"dark"}
                        variant="compact"
                      />
                      <ThemedText
                        style={styles.stepperValue}
                        lightColor="#F8FAFC"
                        darkColor="#F8FAFC"
                      >
                        {config.reps}
                      </ThemedText>
                      <StepperButton
                        icon="add-outline"
                        onPress={() => incrementReps(item.id)}
                        accessibilityLabel={t(
                          "routineBuilder.exercises.increment",
                          {
                            exercise: item.title,
                          },
                        )}
                        colorScheme={"dark"}
                        variant="compact"
                      />
                    </View>
                    <Pressable
                      onPress={() => toggleExercise(item.id)}
                      accessibilityRole="switch"
                      accessibilityState={{ checked: config.isSelected }}
                      accessibilityLabel={t(
                        "routineBuilder.exercises.toggleA11y",
                        {
                          exercise: item.title,
                        },
                      )}
                      hitSlop={TOGGLE_HIT_SLOP}
                      style={({ pressed }) => [
                        styles.selectionButton,
                        config.isSelected
                          ? styles.selectionButtonSelected
                          : styles.selectionButtonUnselected,
                        pressed ? styles.selectionButtonPressed : null,
                      ]}
                    >
                      <Ionicons
                        name={
                          config.isSelected ? "checkmark-circle" : "add-circle"
                        }
                        size={16}
                        color={toggleIconColor}
                        style={styles.selectionIcon}
                      />
                      <ThemedText
                        style={styles.selectionLabel}
                        lightColor={config.isSelected ? "#DCFCE7" : "#F8FAFC"}
                        darkColor={config.isSelected ? "#DCFCE7" : "#F8FAFC"}
                      >
                        {config.isSelected
                          ? t("routineBuilder.exercises.buttonSelected")
                          : t("routineBuilder.exercises.buttonAdd")}
                      </ThemedText>
                    </Pressable>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </ThemedView>
      );
    },
    [
      colorScheme,
      decrementReps,
      exerciseCardTone,
      exercises,
      incrementReps,
      t,
      toggleExercise,
    ],
  );

  const headerComponent = (
    <View>
      <ThemedView style={styles.header}>
        <ThemedText type="title">{t("routineBuilder.title")}</ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          {t("routineBuilder.subtitle")}
        </ThemedText>
      </ThemedView>
      <ThemedView style={[styles.roundsCard, roundsCardTone]}>
        <ThemedText type="subtitle">
          {t("routineBuilder.rounds.label")}
        </ThemedText>
        <ThemedText style={styles.roundsDescription}>
          {t("routineBuilder.rounds.description")}
        </ThemedText>
        <View style={styles.roundsValueRow}>
          <StepperButton
            icon="remove-outline"
            onPress={decrementRounds}
            accessibilityLabel={t("routineBuilder.rounds.decrement")}
            disabled={rounds <= 1}
            colorScheme={colorScheme}
          />
          <ThemedText style={styles.roundsValue}>{rounds}</ThemedText>
          <StepperButton
            icon="add-outline"
            onPress={incrementRounds}
            accessibilityLabel={t("routineBuilder.rounds.increment")}
            colorScheme={colorScheme}
          />
        </View>
      </ThemedView>
      <ThemedView style={styles.sectionHeading}>
        <ThemedText type="subtitle">
          {t("routineBuilder.exercises.title")}
        </ThemedText>
        <ThemedText style={styles.sectionSubtitle}>
          {t("routineBuilder.exercises.subtitle")}
        </ThemedText>
        <ThemedText style={styles.sectionCaption}>
          {t("routineBuilder.exercises.selectedCount", {
            count: selectedCount,
          })}
        </ThemedText>
      </ThemedView>
    </View>
  );

  const footerComponent = (
    <View style={[styles.footer, { paddingBottom: insets.bottom + 24 }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={t("routineBuilder.cta")}
        accessibilityHint={t("routineBuilder.cta")}
        disabled={selectedCount === 0}
        style={({ pressed }) => [
          styles.ctaButton,
          selectedCount === 0 ? styles.ctaButtonDisabled : null,
          pressed ? styles.ctaButtonPressed : null,
        ]}
        onPress={() => {
          const selectedExercises = EXERCISE_DEFINITIONS.filter(
            ({ id }) => exercises[id]?.isSelected,
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
        }}
      >
        <ThemedText
          style={styles.ctaLabel}
          lightColor="#FFFFFF"
          darkColor="#F8FAFC"
        >
          {t("routineBuilder.cta")}
        </ThemedText>
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={exerciseList}
        keyExtractor={(item) => item.id}
        renderItem={renderExercise}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + 48 },
        ]}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default RoutineBuilderScreen;
