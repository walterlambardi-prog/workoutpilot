import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";
import type { ExerciseId } from "@/constants/exercises";
import { useLocalSearchParams } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import { useTheme } from "tamagui";
import { useRoutineAnalysis } from "./hooks/useRoutineAnalysis";

const RoutineAnalysisScreen: React.FC = () => {
  const { t } = useTranslation();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const theme = useTheme();

  const {
    loading,
    error,
    analysis,
    getScoreColor,
    handleReanalyze,
    performAnalysis,
  } = useRoutineAnalysis(routineId);

  if (loading) {
    return (
      <TPage hasHeader>
        <ScreenHeader
          title={t("routineAnalysis.title")}
          subtitle={t("routineAnalysis.subtitle")}
        />
        <TStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <ActivityIndicator
            size="large"
            color={theme.success?.get() as string}
          />
          <TText>{t("routineAnalysis.analyzing")}</TText>
        </TStack>
      </TPage>
    );
  }

  if (error) {
    return (
      <TPage hasHeader>
        <ScreenHeader
          title={t("routineAnalysis.title")}
          subtitle={t("routineAnalysis.subtitle")}
        />
        <TStack gap="$4">
          <TCard borderColor="$error" backgroundColor="$backgroundHover">
            <TText color="$error">{error}</TText>
            <TButton
              variant="primary"
              onPress={() => performAnalysis(true)}
              style={{ marginTop: 12 }}
            >
              {t("routineAnalysis.retry")}
            </TButton>
          </TCard>
        </TStack>
      </TPage>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <TPage hasHeader>
      <ScreenHeader
        title={t("routineAnalysis.title")}
        subtitle={t("routineAnalysis.subtitle")}
      />
      <TStack gap="$4">
        {/* Overall Score */}
        <TCard
          borderColor={getScoreColor(analysis.overallScore)}
          backgroundColor="$backgroundHover"
          alignItems="center"
          gap="$2"
        >
          <THeading level={1} color={getScoreColor(analysis.overallScore)}>
            {analysis.overallScore}
          </THeading>
          <TText variant="label">{t("routineAnalysis.overallScore")}</TText>
        </TCard>

        {/* Overall Feedback */}
        <TCard borderColor="$borderColor" backgroundColor="$backgroundHover">
          <THeading level={3}>{t("routineAnalysis.feedback")}</THeading>
          <TText>{analysis.overallFeedback}</TText>
        </TCard>

        {/* Strengths */}
        <TCard borderColor="$borderColor" backgroundColor="$backgroundHover">
          <THeading level={3}>{t("routineAnalysis.strengths")}</THeading>
          <TStack gap="$2">
            {analysis.strengths.map((strength, index) => (
              <TRow key={index} gap="$2" alignItems="center">
                <TText color="$success">✓</TText>
                <TText>{strength}</TText>
              </TRow>
            ))}
          </TStack>
        </TCard>

        {/* Improvements */}
        <TCard borderColor="$borderColor" backgroundColor="$backgroundHover">
          <THeading level={3}>{t("routineAnalysis.improvements")}</THeading>
          <TStack gap="$2">
            {analysis.improvements.map((improvement, index) => (
              <TRow key={index} gap="$2" alignItems="center">
                <TText color="$warning">→</TText>
                <TText>{improvement}</TText>
              </TRow>
            ))}
          </TStack>
        </TCard>

        {/* Exercise Breakdown */}
        <TCard borderColor="$borderColor" backgroundColor="$backgroundHover">
          <THeading level={3}>
            {t("routineAnalysis.exerciseBreakdown")}
          </THeading>
          <TStack gap="$3">
            {analysis.exercises.map((exercise, index) => {
              const definition =
                EXERCISE_DEFINITION_MAP[exercise.exerciseId as ExerciseId];
              return (
                <TCard
                  key={index}
                  borderColor={getScoreColor(exercise.performanceScore)}
                  backgroundColor="$backgroundHover"
                  gap="$2"
                >
                  <TRow alignItems="center" justifyContent="space-between">
                    <TText fontWeight="700">
                      {definition
                        ? t(`${definition.copyKey}.title`)
                        : exercise.exerciseId}
                    </TText>
                    <TText
                      color={getScoreColor(exercise.performanceScore)}
                      fontWeight="700"
                    >
                      {exercise.performanceScore}
                    </TText>
                  </TRow>
                  <TText>{exercise.feedback}</TText>
                  <TStack gap="$1">
                    {exercise.suggestions.map((suggestion, idx) => (
                      <TText key={idx} color="$placeholderColor">
                        • {suggestion}
                      </TText>
                    ))}
                  </TStack>
                </TCard>
              );
            })}
          </TStack>
        </TCard>

        {/* Next Steps */}
        <TCard borderColor="$borderColor" backgroundColor="$backgroundHover">
          <THeading level={3}>{t("routineAnalysis.nextSteps")}</THeading>
          <TStack gap="$2">
            {analysis.nextSteps.map((step, index) => (
              <TRow key={index} gap="$2" alignItems="center">
                <TText color="$success">{index + 1}.</TText>
                <TText>{step}</TText>
              </TRow>
            ))}
          </TStack>
        </TCard>

        <TButton
          variant="primary"
          onPress={handleReanalyze}
          style={{ marginTop: 12 }}
        >
          {t("routineAnalysis.reanalyze")}
        </TButton>
      </TStack>
    </TPage>
  );
};

export default RoutineAnalysisScreen;
