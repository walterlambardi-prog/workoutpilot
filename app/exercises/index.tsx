import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import ExerciseCard from "@/components/ExerciseCard";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { ALLOWED_EXERCISES, ExerciseId } from "@/constants/exercises";
import { EXERCISE_DEFINITIONS } from "./exercises.data";

import ScreenHeader from "@/components/ScreenHeader";
import {
  type ExerciseListItem,
  type ExercisesScreenProps,
} from "./exercises.types";

const ExercisesScreen: React.FC<ExercisesScreenProps> = () => {
  const { t } = useTranslation();
  const router = useRouter();

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
      if (exerciseId === ExerciseId.WALKING) {
        router.push("/exercises/walking");
        return;
      }

      router.push({
        pathname: "/exercises/[exerciseId]",
        params: { exerciseId },
      });
    },
    [router],
  );

  return (
    <TPage scrollable hasHeader>
      <ScreenHeader
        title={t("exercises.list.title")}
        subtitle={t("exercises.list.subtitle")}
      />
      <TGrid columns={3} gap="$3">
        {exercises.map((item) => (
          <ExerciseCard
            key={item.id}
            title={item.title}
            description={item.description}
            image={item.image}
            accessibilityHint={t("exercises.list.card.accessibilityHint", {
              exercise: item.title,
            })}
            onPress={() => handlePress(item.id)}
          />
        ))}
      </TGrid>
    </TPage>
  );
};

export default ExercisesScreen;
