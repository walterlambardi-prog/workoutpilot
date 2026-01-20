import { useLocalSearchParams, useNavigation, useRouter } from "expo-router";
import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import Exercises from "@/components/exercises";
import { ThemedView } from "@/components/themedView";
import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import styles from "./exerciseSession.styles";

const ExerciseSessionScreen: React.FC = () => {
  const { exerciseId } = useLocalSearchParams();
  const router = useRouter();
  const navigation = useNavigation();
  const { t } = useTranslation();

  const normalizedId = useMemo(() => {
    const value = Array.isArray(exerciseId) ? exerciseId[0] : exerciseId;
    return value ?? null;
  }, [exerciseId]);

  const exerciseDefinition = normalizedId
    ? EXERCISE_DEFINITION_MAP[normalizedId as ExerciseId]
    : undefined;

  const exerciseTitle = exerciseDefinition
    ? t(`${exerciseDefinition.copyKey}.title`)
    : t("exercises.session.fallbackTitle");

  useEffect(() => {
    navigation.setOptions({ title: exerciseTitle });
  }, [exerciseTitle, navigation]);

  useEffect(() => {
    if (!exerciseDefinition) {
      router.replace("/exercises");
    }
  }, [exerciseDefinition, router]);

  useEffect(() => {
    if (exerciseDefinition) {
      useExerciseSessionStore
        .getState()
        .startSession({ exerciseId: exerciseDefinition.id });
    }

    return () => {
      useExerciseSessionStore.getState().endSession();
    };
  }, [exerciseDefinition]);

  if (!exerciseDefinition) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <Exercises exerciseId={exerciseDefinition.id} />
    </ThemedView>
  );
};

export default ExerciseSessionScreen;
