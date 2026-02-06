import React from "react";
import { useTranslation } from "react-i18next";

import ExerciseCard from "@/components/ExerciseCard";
import ScreenHeader from "@/components/ScreenHeader";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";

import type { ExercisesScreenProps } from "./exercises.types";
import { useExercisesList } from "./hooks/useExercisesList";

const ExercisesScreen: React.FC<ExercisesScreenProps> = () => {
  const { t } = useTranslation();
  const { exercises, handlePress, handleViewDetails } = useExercisesList();

  return (
    <TPage scrollable hasHeader>
      <ScreenHeader
        title={t("exercises.list.title")}
        subtitle={t("exercises.list.subtitle")}
      />
      <TGrid columns={3} gap="$6">
        {exercises.map((item) => (
          <ExerciseCard
            key={item.id}
            title={item.title}
            description={item.description}
            image={item.image}
            accessibilityHint={t("exercises.list.card.accessibilityHint", {
              exercise: item.title,
            })}
            onViewDetails={() => handleViewDetails(item.id)}
            onStart={() => handlePress(item.id)}
          />
        ))}
      </TGrid>
    </TPage>
  );
};

export default ExercisesScreen;
