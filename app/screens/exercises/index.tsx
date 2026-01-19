import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, type ListRenderItemInfo } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ExerciseCard from "@/components/ExerciseCard";
import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { ExerciseId } from "@/constants/exercises";
import { EXERCISE_DEFINITIONS } from "./exercises.data";
import styles from "./exercises.styles";

import {
  type ExerciseListItem,
  type ExercisesScreenProps,
} from "./exercises.types";

const ExercisesScreen: React.FC<ExercisesScreenProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const exercises = useMemo<ExerciseListItem[]>(
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

  const ctaLabel = t("exercises.list.card.cta");

  const handlePress = useCallback(
    (exerciseId: ExerciseId) => {
      router.push({
        pathname: "/exercises/[exerciseId]",
        params: { exerciseId },
      });
    },
    [router],
  );

  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<ExerciseListItem>) => (
      <ExerciseCard
        title={item.title}
        description={item.description}
        cta={ctaLabel}
        image={item.image}
        accessibilityHint={t("exercises.list.card.accessibilityHint", {
          exercise: item.title,
        })}
        onPress={() => handlePress(item.id)}
      />
    ),
    [ctaLabel, handlePress, t],
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={exercises}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: 24,
            paddingBottom: insets.bottom + 24,
          },
        ]}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        ListHeaderComponent={
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title} type="title">
              {t("exercises.list.title")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("exercises.list.subtitle")}
            </ThemedText>
          </ThemedView>
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default ExercisesScreen;
