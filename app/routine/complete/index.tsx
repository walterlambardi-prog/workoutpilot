import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import {
  useRoutineSessionStore,
  type RoutineSession,
  type RoutineStepResult,
} from "@/stores/routineSessionStore";

import styles from "./complete.styles";
import type { RoutineCompleteScreenProps } from "./complete.types";

const formatDuration = (ms: number | null) => {
  if (!ms || ms <= 0) return "--";
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const RoutineCompleteScreen: React.FC<RoutineCompleteScreenProps> = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

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

  const { history, lastCompletedSession, restartFromSession } =
    useRoutineSessionStore();

  const missingSessionRedirectedRef = useRef(false);

  const session = useMemo(() => {
    if (sessionId) {
      const found = history.find(
        (entry: RoutineSession) => entry.id === sessionId,
      );
      if (found) return found;
    }
    return lastCompletedSession ?? history[0] ?? null;
  }, [history, lastCompletedSession, sessionId]);

  useEffect(() => {
    if (!session && !missingSessionRedirectedRef.current) {
      missingSessionRedirectedRef.current = true;
      router.replace("/routine");
    }
  }, [router, session]);

  const duration = session?.completedAt
    ? formatDuration(session.completedAt - session.startedAt)
    : "--";
  const totalReps = session?.totalReps ?? 0;
  const uniqueExercises = session
    ? new Set(session.plan.map((step) => step.exerciseId)).size
    : 0;

  const sortedSteps = useMemo(
    () =>
      session
        ? [...session.stepResults].sort((a, b) => a.stepIndex - b.stepIndex)
        : [],
    [session],
  );

  const groupedRounds = useMemo(() => {
    const roundMap: Record<
      number,
      {
        round: number;
        steps: RoutineStepResult[];
        totalReps: number;
        totalDurationMs: number;
      }
    > = {};

    sortedSteps.forEach((step) => {
      const existing = roundMap[step.round] ?? {
        round: step.round,
        steps: [],
        totalReps: 0,
        totalDurationMs: 0,
      };

      existing.steps.push(step);
      existing.totalReps += step.reps;
      existing.totalDurationMs += step.durationMs ?? 0;
      roundMap[step.round] = existing;
    });

    return Object.values(roundMap).sort((a, b) => a.round - b.round);
  }, [sortedSteps]);

  if (!session) {
    return null;
  }

  const handleRepeat = () => {
    const firstStep = session.plan[0];
    const nextId = restartFromSession(session.id);
    if (!firstStep || !nextId) return;

    router.replace({
      pathname: "/exercises/[exerciseId]",
      params: {
        exerciseId: firstStep.exerciseId,
        routineId: nextId,
        stepIndex: "0",
      },
    });
  };

  const handleBackToRoutine = () => {
    router.replace("/routine");
  };

  const handleGoHome = () => {
    router.replace("/");
  };

  return (
    <ThemedView
      style={[
        styles.container,
        { paddingBottom: insets.bottom + 24, backgroundColor },
      ]}
    >
      <ScrollView
        contentContainerStyle={{ gap: 16, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
      >
        <ThemedView
          style={[styles.hero, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.heroTitle}>
            {t("routineComplete.title")}
          </ThemedText>
          <ThemedText style={[styles.heroSubtitle, { color: subtleText }]}>
            {t("routineComplete.subtitle", { rounds: session.rounds })}
          </ThemedText>
          <ThemedText style={[styles.heroSubtitle, { color: mutedText }]}>
            {t("routineComplete.encourage")}
          </ThemedText>
        </ThemedView>

        <View style={styles.statsRow}>
          <ThemedView
            style={[
              styles.statCard,
              { backgroundColor: surfaceColor, borderColor },
            ]}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedText style={[styles.statLabel, { color: mutedText }]}>
              {t("routineComplete.stats.totalReps")}
            </ThemedText>
            <ThemedText style={styles.statValue}>{totalReps}</ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.statCard,
              { backgroundColor: surfaceColor, borderColor },
            ]}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedText style={[styles.statLabel, { color: mutedText }]}>
              {t("routineComplete.stats.duration")}
            </ThemedText>
            <ThemedText style={styles.statValue}>{duration}</ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.statCard,
              { backgroundColor: surfaceColor, borderColor },
            ]}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedText style={[styles.statLabel, { color: mutedText }]}>
              {t("routineComplete.stats.rounds")}
            </ThemedText>
            <ThemedText style={styles.statValue}>{session.rounds}</ThemedText>
          </ThemedView>
          <ThemedView
            style={[
              styles.statCard,
              { backgroundColor: surfaceColor, borderColor },
            ]}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedText style={[styles.statLabel, { color: mutedText }]}>
              {t("routineComplete.stats.exercises")}
            </ThemedText>
            <ThemedText style={styles.statValue}>{uniqueExercises}</ThemedText>
          </ThemedView>
        </View>

        <View style={styles.buttonsRow}>
          <Pressable
            onPress={handleRepeat}
            style={({ pressed }) => [
              styles.button,
              styles.buttonPrimary,
              pressed ? { opacity: 0.9 } : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("routineComplete.actions.repeat")}
          >
            <ThemedText style={styles.buttonText}>
              {t("routineComplete.actions.repeat")}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={handleBackToRoutine}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              pressed ? { opacity: 0.8 } : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("routineComplete.actions.backToRoutine")}
          >
            <ThemedText style={styles.buttonText}>
              {t("routineComplete.actions.backToRoutine")}
            </ThemedText>
          </Pressable>
          <Pressable
            onPress={handleGoHome}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              pressed ? { opacity: 0.8 } : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("routineComplete.actions.home")}
          >
            <ThemedText style={styles.buttonText}>
              {t("routineComplete.actions.home")}
            </ThemedText>
          </Pressable>
        </View>

        <ThemedView
          style={[
            styles.summaryCard,
            { backgroundColor: surfaceColor, borderColor },
          ]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.summaryHeader}>
            {t("routineComplete.summary.title")}
          </ThemedText>
          <View style={styles.summaryRounds}>
            {groupedRounds.map((group) => (
              <View
                key={`round-${group.round}`}
                style={[styles.summaryRound, { borderColor }]}
              >
                <View style={styles.summaryRoundHeader}>
                  <ThemedText style={styles.summaryRoundTitle}>
                    {t("routineComplete.summary.round", {
                      round: group.round,
                    })}
                  </ThemedText>
                  <ThemedText
                    style={[styles.summaryRoundMeta, { color: subtleText }]}
                  >
                    {t("routineComplete.summary.roundMeta", {
                      count: group.steps.length,
                      reps: group.totalReps,
                    })}
                  </ThemedText>
                  <ThemedText
                    style={[styles.summaryRoundMeta, { color: subtleText }]}
                  >
                    {t("routineComplete.summary.roundDuration", {
                      duration: formatDuration(group.totalDurationMs),
                    })}
                  </ThemedText>
                </View>

                {group.steps.map((step, index) => {
                  const exerciseTitle = t(
                    `${EXERCISE_COPY_KEYS[step.exerciseId]}.title`,
                  );
                  const isLast = index === group.steps.length - 1;

                  return (
                    <View
                      key={`${step.stepIndex}-${step.exerciseId}`}
                      style={[
                        styles.summaryItem,
                        isLast ? styles.summaryItemLast : null,
                        { borderBottomColor: borderColor },
                      ]}
                    >
                      <ThemedText style={styles.summaryTitle}>
                        {exerciseTitle}
                      </ThemedText>
                      <ThemedText
                        style={[styles.summaryMeta, { color: subtleText }]}
                      >
                        {t("routineComplete.summary.meta", {
                          round: step.round,
                          reps: step.reps,
                          target: step.targetReps,
                        })}
                      </ThemedText>
                    </View>
                  );
                })}
              </View>
            ))}
          </View>
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
};

export default RoutineCompleteScreen;
