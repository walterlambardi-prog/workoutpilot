import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, View } from "react-native";

import { EXERCISE_DEFINITION_MAP } from "@/app/screens/exercises/exercises.data";
import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import styles from "./sessions.styles";
import type { SessionListItem, SessionStatItem } from "./sessions.types";

const formatDuration = (ms?: number) => {
  if (!ms || ms < 0) return "--";
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
};

const formatDate = (timestamp?: number) => {
  if (!timestamp) return "--";
  return new Date(timestamp).toLocaleString();
};

const SessionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const { currentSession, history } = useExerciseSessionStore();

  const totals = useMemo(() => {
    const sessions = [...history, ...(currentSession ? [currentSession] : [])];
    const totalSessions = sessions.length;
    const totalReps = sessions.reduce((sum, s) => sum + (s.reps ?? 0), 0);
    const bestSession = sessions.reduce(
      (best, s) => (s.reps > (best?.reps ?? 0) ? s : best),
      undefined as typeof currentSession | undefined,
    );
    const lastSession = history[0] ?? currentSession ?? null;

    return { totalSessions, totalReps, bestSession, lastSession };
  }, [currentSession, history]);

  const statItems: SessionStatItem[] = [
    {
      label: t("sessions.stats.totalSessions"),
      value: `${totals.totalSessions}`,
    },
    { label: t("sessions.stats.totalReps"), value: `${totals.totalReps}` },
    {
      label: t("sessions.stats.bestSession"),
      value: totals.bestSession
        ? `${t(
            `${EXERCISE_DEFINITION_MAP[totals.bestSession.exerciseId as ExerciseId].copyKey}.title`,
          )} · ${totals.bestSession.reps} ${t("sessions.labels.reps")}`
        : t("sessions.empty.bestSession"),
    },
    {
      label: t("sessions.stats.lastSession"),
      value: totals.lastSession
        ? `${t(
            `${EXERCISE_DEFINITION_MAP[totals.lastSession.exerciseId as ExerciseId].copyKey}.title`,
          )} · ${formatDate(totals.lastSession.endedAt ?? totals.lastSession.startedAt)}`
        : t("sessions.empty.lastSession"),
    },
  ];

  const recentHistory: SessionListItem[] = history
    .slice(0, 8)
    .map((item): SessionListItem => {
      const copyKey =
        EXERCISE_DEFINITION_MAP[item.exerciseId as ExerciseId].copyKey;
      return {
        id: item.id,
        title: t(`${copyKey}.title`),
        subtitle: t("sessions.history.meta", {
          duration: formatDuration(item.durationMs),
          ended: formatDate(item.endedAt ?? item.startedAt),
        }),
        repsLabel: `${item.reps} ${t("sessions.labels.reps")}`,
        durationLabel: `${t("sessions.labels.duration")}: ${formatDuration(item.durationMs)}`,
        endedLabel: `${t("sessions.labels.ended")}: ${formatDate(item.endedAt ?? item.startedAt)}`,
      };
    });

  return (
    <ScrollView style={styles.page} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t("sessions.title")}</ThemedText>
        <ThemedText style={styles.subtitle}>
          {t("sessions.subtitle")}
        </ThemedText>
      </View>

      <View style={styles.cards}>
        <ThemedView style={styles.card}>
          <ThemedText style={styles.cardTitle}>
            {t("sessions.stats.title")}
          </ThemedText>
          {statItems.map((item) => (
            <View key={item.label} style={styles.statRow}>
              <ThemedText style={styles.statLabel}>{item.label}</ThemedText>
              <ThemedText style={styles.statValue}>{item.value}</ThemedText>
            </View>
          ))}
        </ThemedView>
        <ThemedView style={styles.card}>
          <ThemedText style={styles.cardTitle}>
            {t("sessions.history.title")}
          </ThemedText>
          {recentHistory.length === 0 ? (
            <ThemedText style={styles.empty}>
              {t("sessions.history.empty")}
            </ThemedText>
          ) : (
            recentHistory.map((item) => (
              <View key={item.id} style={styles.historyItem}>
                <ThemedText style={styles.historyTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.historySubtitle}>
                  {item.subtitle}
                </ThemedText>
                <ThemedText style={styles.historyMeta}>
                  {item.repsLabel}
                </ThemedText>
                {item.durationLabel ? (
                  <ThemedText style={styles.historyMeta}>
                    {item.durationLabel}
                  </ThemedText>
                ) : null}
                {item.endedLabel ? (
                  <ThemedText style={styles.historyMeta}>
                    {item.endedLabel}
                  </ThemedText>
                ) : null}
              </View>
            ))
          )}
        </ThemedView>
      </View>
    </ScrollView>
  );
};

export default SessionsScreen;
