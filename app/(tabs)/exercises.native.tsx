import React from "react";
import { FlatList, StyleSheet } from "react-native";

import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const exercises = [
  { id: "pushups", title: "Push-ups", desc: "3 x 12 reps" },
  { id: "squats", title: "Air Squats", desc: "3 x 15 reps" },
  { id: "plank", title: "Plank", desc: "3 x 45s hold" },
];

export default function ExercisesNativeScreen() {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#E2F3FF", dark: "#0D2538" }}
      headerImage={
        <ThemedText type="title" style={styles.headerTitle}>
          Exercises
        </ThemedText>
      }
    >
      <ThemedView style={styles.listContainer}>
        <FlatList
          data={exercises}
          keyExtractor={(item) => item.id}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          renderItem={({ item }) => (
            <ThemedView style={styles.card}>
              <ThemedText type="subtitle">{item.title}</ThemedText>
              <ThemedText>{item.desc}</ThemedText>
            </ThemedView>
          )}
        />
      </ThemedView>
    </ParallaxScrollView>
  );
}

const styles = StyleSheet.create({
  headerTitle: {
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  listContainer: {
    gap: 12,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
  },
  separator: {
    height: 12,
  },
});
