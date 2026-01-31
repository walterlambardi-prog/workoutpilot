import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import { analyzeRoutine } from "@/app/routineAnalysis/routineAnalysis.service";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";
import type { ExerciseId } from "@/constants/exercises";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator } from "react-native";
import type {
  ExercisePerformance,
  RoutineAnalysisRequest,
  RoutineAnalysisResponse,
} from "./routineAnalysis.types";

const RoutineAnalysisScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { history, getAnalysis, saveAnalysis } = useRoutineSessionStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoutineAnalysisResponse | null>(
    null,
  );

  // Tamagui tokens/colors
  const successColor = "$success";
  const warningColor = "$warning";
  const errorColor = "$error";
  const surfaceColor = "$backgroundHover";
  const borderColor = "$borderColor";
  const subtleText = "$placeholderColor";

  const getScoreColor = (score: number) => {
    if (score >= 80) return successColor;
    if (score >= 60) return warningColor;
    return errorColor;
  };

  const handleReanalyze = () => {
    performAnalysis(true);
  };

  const performAnalysis = async (forceRefresh = false) => {
    if (!routineId) {
      setError(t("routineAnalysis.errors.noRoutineId"));
      setLoading(false);
      return;
    }

    // Check if analysis is already cached
    const cachedAnalysis = getAnalysis(routineId);
    if (cachedAnalysis && !forceRefresh) {
      setAnalysis(cachedAnalysis);
      setLoading(false);
      return;
    }

    const routine = history.find((r) => r.id === routineId);

    if (!routine || !routine.completedAt) {
      setError(t("routineAnalysis.errors.routineNotFound"));
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Aggregate exercise performance with round details
      const exerciseMap = new Map<ExerciseId, ExercisePerformance>();

      routine.stepResults.forEach((step) => {
        const existing = exerciseMap.get(step.exerciseId);
        const timePerRep = step.reps > 0 ? step.durationMs / step.reps : 0;

        if (existing) {
          existing.actualReps += step.reps;
          existing.durationMs += step.durationMs;
          existing.rounds += 1;
          existing.roundDetails.push({
            roundNumber: existing.rounds,
            reps: step.reps,
            durationMs: step.durationMs,
            timePerRep,
          });
        } else {
          exerciseMap.set(step.exerciseId, {
            exerciseId: step.exerciseId,
            targetReps: step.targetReps,
            actualReps: step.reps,
            durationMs: step.durationMs,
            rounds: 1,
            roundDetails: [
              {
                roundNumber: 1,
                reps: step.reps,
                durationMs: step.durationMs,
                timePerRep,
              },
            ],
          });
        }
      });

      const requestData: RoutineAnalysisRequest = {
        routineId: routine.id,
        totalRounds: routine.rounds,
        totalDurationMs: routine.completedAt - routine.startedAt,
        totalReps: routine.totalReps,
        startedAt: routine.startedAt,
        completedAt: routine.completedAt,
        exercises: Array.from(exerciseMap.values()),
      };

      const result = await analyzeRoutine(requestData, i18n.language);
      setAnalysis(result);
      saveAnalysis(routineId, result);
    } catch (err) {
      console.error("Analysis error:", err);
      setError(
        err instanceof Error
          ? err.message
          : t("routineAnalysis.errors.generic"),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  if (loading) {
    return (
      <TPage>
        <ScreenHeader
          title={t("routineAnalysis.title")}
          subtitle={t("routineAnalysis.subtitle")}
        />
        <TStack flex={1} alignItems="center" justifyContent="center" gap="$4">
          <ActivityIndicator size="large" color="#10b981" />
          <TText>{t("routineAnalysis.analyzing")}</TText>
        </TStack>
      </TPage>
    );
  }

  if (error) {
    return (
      <TPage>
        <ScreenHeader
          title={t("routineAnalysis.title")}
          subtitle={t("routineAnalysis.subtitle")}
        />
        <TStack gap="$4">
          <TCard borderColor={errorColor} backgroundColor={surfaceColor}>
            <TText color={errorColor}>{error}</TText>
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
    <TPage>
      <ScreenHeader
        title={t("routineAnalysis.title")}
        subtitle={t("routineAnalysis.subtitle")}
      />
      <TStack gap="$4">
        {/* Overall Score */}
        <TCard
          borderColor={getScoreColor(analysis.overallScore)}
          backgroundColor={surfaceColor}
          alignItems="center"
          gap="$2"
        >
          <THeading level={1} color={getScoreColor(analysis.overallScore)}>
            {analysis.overallScore}
          </THeading>
          <TText variant="label">{t("routineAnalysis.overallScore")}</TText>
        </TCard>

        {/* Overall Feedback */}
        <TCard borderColor={borderColor} backgroundColor={surfaceColor}>
          <THeading level={3}>{t("routineAnalysis.feedback")}</THeading>
          <TText>{analysis.overallFeedback}</TText>
        </TCard>

        {/* Strengths */}
        <TCard borderColor={borderColor} backgroundColor={surfaceColor}>
          <THeading level={3}>{t("routineAnalysis.strengths")}</THeading>
          <TStack gap="$2">
            {analysis.strengths.map((strength, index) => (
              <TRow key={index} gap="$2" alignItems="center">
                <TText color={successColor}>✓</TText>
                <TText>{strength}</TText>
              </TRow>
            ))}
          </TStack>
        </TCard>

        {/* Improvements */}
        <TCard borderColor={borderColor} backgroundColor={surfaceColor}>
          <THeading level={3}>{t("routineAnalysis.improvements")}</THeading>
          <TStack gap="$2">
            {analysis.improvements.map((improvement, index) => (
              <TRow key={index} gap="$2" alignItems="center">
                <TText color={warningColor}>→</TText>
                <TText>{improvement}</TText>
              </TRow>
            ))}
          </TStack>
        </TCard>

        {/* Exercise Breakdown */}
        <TCard borderColor={borderColor} backgroundColor={surfaceColor}>
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
                  backgroundColor={surfaceColor}
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
                      <TText key={idx} color={subtleText}>
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
        <TCard borderColor={borderColor} backgroundColor={surfaceColor}>
          <THeading level={3}>{t("routineAnalysis.nextSteps")}</THeading>
          <TStack gap="$2">
            {analysis.nextSteps.map((step, index) => (
              <TRow key={index} gap="$2" alignItems="center">
                <TText color={successColor}>{index + 1}.</TText>
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
