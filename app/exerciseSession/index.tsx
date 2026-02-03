import React from "react";

import Exercises from "@/components/Exercises";
import { ThemedView } from "@/components/ThemedView";

import styles from "./exerciseSession.styles";
import { useExerciseSession } from "./hooks/useExerciseSession";

const ExerciseSessionScreen: React.FC = () => {
  const { exerciseDefinition, routineContext } = useExerciseSession();

  if (!exerciseDefinition) {
    return null;
  }

  return (
    <ThemedView style={styles.container}>
      <Exercises
        exerciseId={exerciseDefinition.id}
        routineContext={routineContext}
      />
    </ThemedView>
  );
};

export default ExerciseSessionScreen;
