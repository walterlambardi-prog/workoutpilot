import React from "react";
import { View } from "react-native";

import Exercises from "@/components/exercises";
import styles from "./exercises.styles";
import { ExercisesScreenProps } from "./exercises.types";

const ExercisesScreen: React.FC<ExercisesScreenProps> = () => {
  return (
    <View style={styles.container}>
      <Exercises />
    </View>
  );
};

export default ExercisesScreen;
