import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { FlatList, type ListRenderItemInfo } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ExerciseCard from "@/components/ExerciseCard";
import ScreenHeader from "@/components/ScreenHeader";
import { ThemedView } from "@/components/ThemedView";
import { ALLOWED_EXERCISES, ExerciseId } from "@/constants/exercises";
import { ScreenPadding } from "@/constants/theme";
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
        image={item.image}
        accessibilityHint={t("exercises.list.card.accessibilityHint", {
          exercise: item.title,
        })}
        onPress={() => handlePress(item.id)}
      />
    ),
    [handlePress, t],
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
            paddingTop: ScreenPadding.vertical,
            paddingBottom: insets.bottom + ScreenPadding.vertical,
          },
        ]}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        ListHeaderComponent={
          <ScreenHeader
            title={t("exercises.list.title")}
            subtitle={t("exercises.list.subtitle")}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
};

export default ExercisesScreen;
