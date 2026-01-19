import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image, ScrollView, View } from "react-native";

import { EXERCISE_DEFINITION_MAP } from "@/app/screens/exercises/exercises.data";
import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { ExerciseId } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
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
  const thumbBackground = useThemeColor(
    { light: "#f1f5f9", dark: "#111827" },
    "background",
  );

  const totals = useMemo(() => {
    const now = Date.now();
    const sessions = [
      ...history,
      ...(currentSession
        ? [
            {
              ...currentSession,
              durationMs:
                currentSession.durationMs ?? now - currentSession.startedAt,
            },
          ]
        : []),
    ];

    const totalSessions = sessions.length;
    const totalReps = sessions.reduce((sum, s) => sum + (s.reps ?? 0), 0);
    const totalDurationMs = sessions.reduce(
      (sum, s) => sum + (s.durationMs ?? 0),
      0,
    );
    const bestSession = sessions.reduce(
      (best, s) => (s.reps > (best?.reps ?? 0) ? s : best),
      undefined as typeof currentSession | undefined,
    );
    const lastSession = history[0] ?? currentSession ?? null;
    const uniqueExercises = new Set(
      sessions.map((s) => s.exerciseId as ExerciseId),
    ).size;

    return {
      totalSessions,
      totalReps,
      totalDurationMs,
      bestSession,
      lastSession,
      averageReps:
        totalSessions > 0 ? Math.round(totalReps / totalSessions) : 0,
      uniqueExercises,
    };
  }, [currentSession, history]);

  const breakdown = useMemo(() => {
    const now = Date.now();
    const sessions = [
      ...history,
      ...(currentSession
        ? [
            {
              ...currentSession,
              durationMs:
                currentSession.durationMs ?? now - currentSession.startedAt,
            },
          ]
        : []),
    ];

    return Object.values(EXERCISE_DEFINITION_MAP)
      .map((definition) => {
        const scoped = sessions.filter((s) => s.exerciseId === definition.id);
        const reps = scoped.reduce((sum, s) => sum + (s.reps ?? 0), 0);
        const totalDuration = scoped.reduce(
          (sum, s) => sum + (s.durationMs ?? 0),
          0,
        );
        const last = scoped[0];

        return {
          definition,
          reps,
          sessions: scoped.length,
          last,
          totalDuration,
        };
      })
      .sort((a, b) => b.reps - a.reps);
  }, [currentSession, history]);

  const statItems: SessionStatItem[] = [
    {
      label: t("sessions.stats.totalSessions"),
      value: `${totals.totalSessions}`,
    },
    { label: t("sessions.stats.totalReps"), value: `${totals.totalReps}` },
    {
      label: t("sessions.stats.totalDuration"),
      value: formatDuration(totals.totalDurationMs),
    },
    {
      label: t("sessions.stats.averageReps"),
      value: `${totals.averageReps}`,
    },
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
          )} · ${formatDate(
            totals.lastSession.endedAt ?? totals.lastSession.startedAt,
          )}`
        : t("sessions.empty.lastSession"),
    },
    {
      label: t("sessions.stats.exercisesTracked"),
      value: `${totals.uniqueExercises}`,
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
        durationLabel: `${t("sessions.labels.duration")}: ${formatDuration(
          item.durationMs,
        )}`,
        endedLabel: `${t("sessions.labels.ended")}: ${formatDate(
          item.endedAt ?? item.startedAt,
        )}`,
      };
    });

  return (
    <ScrollView
      style={[styles.page, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <ThemedText style={styles.title}>{t("sessions.title")}</ThemedText>
        <ThemedText style={[styles.subtitle, { color: mutedText }]}>
          {t("sessions.subtitle")}
        </ThemedText>
      </View>

      <View style={styles.cards}>
        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("sessions.stats.title")}
          </ThemedText>
          {statItems.map((item) => (
            <View key={item.label} style={styles.statRow}>
              <ThemedText style={[styles.statLabel, { color: mutedText }]}>
                {item.label}
              </ThemedText>
              <ThemedText style={styles.statValue}>{item.value}</ThemedText>
            </View>
          ))}
        </ThemedView>
        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("sessions.breakdown.title")}
          </ThemedText>
          {breakdown.map((item) => (
            <View
              key={item.definition.id}
              style={[styles.breakdownRow, { borderBottomColor: borderColor }]}
            >
              <Image
                source={item.definition.image}
                style={[
                  styles.thumb,
                  { borderColor, backgroundColor: thumbBackground },
                ]}
              />
              <View style={styles.breakdownContent}>
                <ThemedText style={styles.historyTitle}>
                  {t(`${item.definition.copyKey}.title`)}
                </ThemedText>
                <ThemedText
                  style={[styles.historySubtitle, { color: mutedText }]}
                >
                  {t("sessions.breakdown.sessionsLabel", {
                    count: item.sessions,
                  })}
                  {" · "}
                  {formatDuration(item.totalDuration)}
                </ThemedText>
                <ThemedText style={[styles.historyMeta, { color: subtleText }]}>
                  {item.last
                    ? t("sessions.breakdown.last", {
                        date: formatDate(
                          item.last.endedAt ?? item.last.startedAt,
                        ),
                      })
                    : t("sessions.breakdown.never")}
                </ThemedText>
              </View>
              <View style={styles.breakdownBadge}>
                <ThemedText style={styles.statValue}>{item.reps}</ThemedText>
                <ThemedText style={[styles.historyMeta, { color: subtleText }]}>
                  {t("sessions.labels.reps")}
                </ThemedText>
              </View>
            </View>
          ))}
        </ThemedView>

        <ThemedView
          style={[styles.card, { backgroundColor: surfaceColor, borderColor }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedText style={styles.cardTitle}>
            {t("sessions.history.title")}
          </ThemedText>
          {recentHistory.length === 0 ? (
            <ThemedText style={[styles.empty, { color: subtleText }]}>
              {t("sessions.history.empty")}
            </ThemedText>
          ) : (
            recentHistory.map((item) => (
              <View
                key={item.id}
                style={[styles.historyItem, { borderBottomColor: borderColor }]}
              >
                <ThemedText style={styles.historyTitle}>
                  {item.title}
                </ThemedText>
                <ThemedText
                  style={[styles.historySubtitle, { color: mutedText }]}
                >
                  {item.subtitle}
                </ThemedText>
                <ThemedText style={[styles.historyMeta, { color: subtleText }]}>
                  {item.repsLabel}
                </ThemedText>
                {item.durationLabel ? (
                  <ThemedText
                    style={[styles.historyMeta, { color: subtleText }]}
                  >
                    {item.durationLabel}
                  </ThemedText>
                ) : null}
                {item.endedLabel ? (
                  <ThemedText
                    style={[styles.historyMeta, { color: subtleText }]}
                  >
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
