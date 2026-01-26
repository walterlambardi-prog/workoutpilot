import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { ActivityIndicator, Pressable, ScrollView, View } from "react-native";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import { analyzeRoutine } from "@/app/routineAnalysis/routineAnalysis.service";
import ScreenHeader from "@/components/ScreenHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import type { ExerciseId } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import styles from "./routineAnalysis.styles";
import type {
    ExercisePerformance,
    RoutineAnalysisRequest,
    RoutineAnalysisResponse,
} from "./routineAnalysis.types";

const RoutineAnalysisScreen: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { routineId } = useLocalSearchParams<{ routineId: string }>();
  const { history } = useRoutineSessionStore();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoutineAnalysisResponse | null>(
    null,
  );

  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor(
    { light: "#f8fafc", dark: "#0b1220" },
    "background",
  );
  const borderColor = useThemeColor(
    { light: "#e2e8f0", dark: "#1f2937" },
    "background",
  );
  const mutedText = useThemeColor(
    { light: "#475569", dark: "#cbd5e1" },
    "text",
  );
  const subtleText = useThemeColor(
    { light: "#64748b", dark: "#94a3b8" },
    "text",
  );
  const successColor = "#10b981";
  const warningColor = "#f59e0b";
  const errorColor = "#ef4444";

  const getScoreColor = (score: number) => {
    if (score >= 80) return successColor;
    if (score >= 60) return warningColor;
    return errorColor;
  };

  const performAnalysis = async () => {
    if (!routineId) {
      setError(t("routineAnalysis.errors.noRoutineId"));
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

      // Aggregate exercise performance
      const exerciseMap = new Map<ExerciseId, ExercisePerformance>();

      routine.stepResults.forEach((step) => {
        const existing = exerciseMap.get(step.exerciseId);
        if (existing) {
          existing.actualReps += step.reps;
          existing.durationMs += step.durationMs;
          existing.rounds += 1;
        } else {
          exerciseMap.set(step.exerciseId, {
            exerciseId: step.exerciseId,
            targetReps: step.targetReps,
            actualReps: step.reps,
            durationMs: step.durationMs,
            rounds: 1,
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
      <View style={[styles.page, { backgroundColor }]}>
        <ScreenHeader
          title={t("routineAnalysis.title")}
          subtitle={t("routineAnalysis.subtitle")}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={successColor} />
          <ThemedText style={styles.loadingText}>
            {t("routineAnalysis.analyzing")}
          </ThemedText>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <ScrollView style={[styles.page, { backgroundColor }]}>
        <ScreenHeader
          title={t("routineAnalysis.title")}
          subtitle={t("routineAnalysis.subtitle")}
        />
        <View style={styles.content}>
          <View
            style={[
              styles.errorContainer,
              { backgroundColor: surfaceColor, borderColor: errorColor },
            ]}
          >
            <ThemedText style={styles.errorText}>{error}</ThemedText>
            <Pressable
              style={[styles.retryButton, { backgroundColor: errorColor }]}
              onPress={performAnalysis}
            >
              <ThemedText
                style={[styles.retryButtonText, { color: "#ffffff" }]}
              >
                {t("routineAnalysis.retry")}
              </ThemedText>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (!analysis) {
    return null;
  }

  return (
    <ScrollView
      style={[styles.page, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title={t("routineAnalysis.title")}
        subtitle={t("routineAnalysis.subtitle")}
      />

      <View style={styles.content}>
        {/* Overall Score */}
        <View
          style={[
            styles.scoreCard,
            {
              backgroundColor: surfaceColor,
              borderColor: getScoreColor(analysis.overallScore),
            },
          ]}
        >
          <ThemedText
            style={[
              styles.scoreValue,
              { color: getScoreColor(analysis.overallScore) },
            ]}
          >
            {analysis.overallScore}
          </ThemedText>
          <ThemedText style={[styles.scoreLabel, { color: mutedText }]}>
            {t("routineAnalysis.overallScore")}
          </ThemedText>
        </View>

        {/* Overall Feedback */}
        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("routineAnalysis.feedback")}
          </ThemedText>
          <ThemedText style={[styles.feedbackText, { color: mutedText }]}>
            {analysis.overallFeedback}
          </ThemedText>
        </ThemedView>

        {/* Strengths */}
        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("routineAnalysis.strengths")}
          </ThemedText>
          {analysis.strengths.map((strength, index) => (
            <View key={index} style={styles.listItem}>
              <ThemedText style={[styles.bullet, { color: successColor }]}>
                ✓
              </ThemedText>
              <ThemedText style={[styles.itemText, { color: mutedText }]}>
                {strength}
              </ThemedText>
            </View>
          ))}
        </ThemedView>

        {/* Improvements */}
        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("routineAnalysis.improvements")}
          </ThemedText>
          {analysis.improvements.map((improvement, index) => (
            <View key={index} style={styles.listItem}>
              <ThemedText style={[styles.bullet, { color: warningColor }]}>
                →
              </ThemedText>
              <ThemedText style={[styles.itemText, { color: mutedText }]}>
                {improvement}
              </ThemedText>
            </View>
          ))}
        </ThemedView>

        {/* Exercise Breakdown */}
        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("routineAnalysis.exerciseBreakdown")}
          </ThemedText>
          {analysis.exercises.map((exercise, index) => {
            const definition =
              EXERCISE_DEFINITION_MAP[exercise.exerciseId as ExerciseId];
            return (
              <View
                key={index}
                style={[
                  styles.exerciseCard,
                  {
                    backgroundColor: surfaceColor,
                    borderColor: getScoreColor(exercise.performanceScore),
                  },
                ]}
              >
                <View style={styles.exerciseHeader}>
                  <ThemedText style={styles.exerciseName}>
                    {definition
                      ? t(`${definition.copyKey}.title`)
                      : exercise.exerciseId}
                  </ThemedText>
                  <ThemedText
                    style={[
                      styles.exerciseScore,
                      { color: getScoreColor(exercise.performanceScore) },
                    ]}
                  >
                    {exercise.performanceScore}
                  </ThemedText>
                </View>
                <ThemedText
                  style={[styles.exerciseFeedback, { color: mutedText }]}
                >
                  {exercise.feedback}
                </ThemedText>
                {exercise.suggestions.map((suggestion, idx) => (
                  <ThemedText
                    key={idx}
                    style={[styles.suggestionItem, { color: subtleText }]}
                  >
                    • {suggestion}
                  </ThemedText>
                ))}
              </View>
            );
          })}
        </ThemedView>

        {/* Next Steps */}
        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("routineAnalysis.nextSteps")}
          </ThemedText>
          {analysis.nextSteps.map((step, index) => (
            <View key={index} style={styles.listItem}>
              <ThemedText style={[styles.bullet, { color: successColor }]}>
                {index + 1}.
              </ThemedText>
              <ThemedText style={[styles.itemText, { color: mutedText }]}>
                {step}
              </ThemedText>
            </View>
          ))}
        </ThemedView>
      </View>
    </ScrollView>
  );
};

export default RoutineAnalysisScreen;
