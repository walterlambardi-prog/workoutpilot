import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image, Pressable, ScrollView, View } from "react-native";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import ScreenHeader from "@/components/ScreenHeader";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { ExerciseId } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import {
  type RoutineSession,
  useRoutineSessionStore,
} from "@/stores/routineSessionStore";
import { useRouter } from "expo-router";
import styles from "./sessions.styles";
import type {
  RoutineListItem,
  SessionListItem,
  SessionStatItem,
} from "./sessions.types";

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
  const router = useRouter();
  const { currentSession, history } = useExerciseSessionStore();
  const applyPlan = useRoutineBuilderStore((state) => state.applyPlan);
  const { history: routineHistory, lastCompletedSession } =
    useRoutineSessionStore();
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

  const routineSessions = useMemo(() => {
    const sessions: RoutineSession[] = [...routineHistory];
    if (
      lastCompletedSession &&
      !sessions.find((entry) => entry.id === lastCompletedSession.id)
    ) {
      sessions.unshift(lastCompletedSession);
    }
    return sessions;
  }, [lastCompletedSession, routineHistory]);

  const routineTotals = useMemo(() => {
    if (routineSessions.length === 0) {
      return {
        totalSessions: 0,
        totalReps: 0,
        totalDurationMs: 0,
        averageReps: 0,
        bestRoutine: null as RoutineSession | null,
        topExercise: null as { exerciseId: ExerciseId; reps: number } | null,
      };
    }

    const totalReps = routineSessions.reduce(
      (sum, session) => sum + (session.totalReps ?? 0),
      0,
    );
    const totalDurationMs = routineSessions.reduce((sum, session) => {
      if (session.completedAt && session.startedAt) {
        return sum + Math.max(0, session.completedAt - session.startedAt);
      }
      return sum;
    }, 0);

    const bestRoutine = routineSessions.reduce(
      (best, session) => {
        if (!best) return session;
        return session.totalReps > (best?.totalReps ?? 0) ? session : best;
      },
      null as RoutineSession | null,
    );

    const exerciseReps = routineSessions.reduce<Record<ExerciseId, number>>(
      (acc, session) => {
        session.stepResults.forEach((step) => {
          acc[step.exerciseId] = (acc[step.exerciseId] ?? 0) + step.reps;
        });
        return acc;
      },
      {} as Record<ExerciseId, number>,
    );

    const topExerciseEntry = Object.entries(exerciseReps).reduce(
      (best, [exerciseId, reps]) => {
        if (!best || reps > best.reps) {
          return { exerciseId: exerciseId as ExerciseId, reps };
        }
        return best;
      },
      null as { exerciseId: ExerciseId; reps: number } | null,
    );

    return {
      totalSessions: routineSessions.length,
      totalReps,
      totalDurationMs,
      averageReps:
        routineSessions.length > 0
          ? Math.round(totalReps / routineSessions.length)
          : 0,
      bestRoutine,
      topExercise: topExerciseEntry,
    };
  }, [routineSessions]);

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

  const statItems: SessionStatItem[] = useMemo(() => {
    const exerciseTotals: Record<ExerciseId, number> = {} as Record<
      ExerciseId,
      number
    >;

    history.forEach((entry) => {
      exerciseTotals[entry.exerciseId] =
        (exerciseTotals[entry.exerciseId] ?? 0) + (entry.reps ?? 0);
    });

    routineSessions.forEach((session) => {
      session.stepResults.forEach((step) => {
        exerciseTotals[step.exerciseId] =
          (exerciseTotals[step.exerciseId] ?? 0) + step.reps;
      });
    });

    const topExercise = Object.entries(exerciseTotals).reduce(
      (best, [exerciseId, reps]) => {
        if (!best || reps > best.reps) {
          return { exerciseId: exerciseId as ExerciseId, reps };
        }
        return best;
      },
      null as { exerciseId: ExerciseId; reps: number } | null,
    );

    return [
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
              `${
                EXERCISE_DEFINITION_MAP[
                  totals.bestSession.exerciseId as ExerciseId
                ].copyKey
              }.title`,
            )} · ${totals.bestSession.reps} ${t("sessions.labels.reps")}`
          : t("sessions.empty.bestSession"),
      },
      {
        label: t("sessions.stats.lastSession"),
        value: totals.lastSession
          ? `${t(
              `${
                EXERCISE_DEFINITION_MAP[
                  totals.lastSession.exerciseId as ExerciseId
                ].copyKey
              }.title`,
            )} · ${formatDate(
              totals.lastSession.endedAt ?? totals.lastSession.startedAt,
            )}`
          : t("sessions.empty.lastSession"),
      },
      {
        label: t("sessions.stats.exercisesTracked"),
        value: `${totals.uniqueExercises}`,
      },
      topExercise
        ? {
            label: t("sessions.stats.topExercise"),
            value: `${t(
              `${EXERCISE_DEFINITION_MAP[topExercise.exerciseId].copyKey}.title`,
            )} · ${topExercise.reps} ${t("sessions.labels.reps")}`,
          }
        : {
            label: t("sessions.stats.topExercise"),
            value: t("sessions.empty.topExercise"),
          },
    ];
  }, [history, routineSessions, t, totals]);

  const routineStatItems: SessionStatItem[] = [
    {
      label: t("sessions.routines.totalSessions"),
      value: `${routineTotals.totalSessions}`,
    },
    {
      label: t("sessions.routines.totalReps"),
      value: `${routineTotals.totalReps}`,
    },
    {
      label: t("sessions.routines.totalDuration"),
      value: formatDuration(routineTotals.totalDurationMs),
    },
    {
      label: t("sessions.routines.averageReps"),
      value: `${routineTotals.averageReps}`,
    },
    {
      label: t("sessions.routines.bestRoutine"),
      value: routineTotals.bestRoutine
        ? `${t("sessions.routines.bestRoutine")}: ${
            routineTotals.bestRoutine.totalReps ?? 0
          } ${t("sessions.labels.reps")}`
        : t("sessions.routines.empty"),
    },
    {
      label: t("sessions.routines.topExercise"),
      value: routineTotals.topExercise
        ? `${t(
            `${
              EXERCISE_DEFINITION_MAP[routineTotals.topExercise.exerciseId]
                .copyKey
            }.title`,
          )} · ${routineTotals.topExercise.reps} ${t("sessions.labels.reps")}`
        : t("sessions.routines.empty"),
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

  const routineList: RoutineListItem[] = routineHistory
    .slice(0, 8)
    .filter((session) => session.completedAt)
    .map((session): RoutineListItem => {
      const uniqueExercises = new Set(
        session.plan.map((step) => step.exerciseId),
      ).size;
      const durationMs = session.completedAt
        ? session.completedAt - session.startedAt
        : 0;

      return {
        id: session.id,
        rounds: session.rounds,
        totalReps: session.totalReps,
        exerciseCount: uniqueExercises,
        durationMs,
        completedAt: session.completedAt ?? session.startedAt,
      };
    });

  return (
    <ScrollView
      style={[styles.page, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <ScreenHeader
        title={t("sessions.title")}
        subtitle={t("sessions.subtitle")}
      />

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
            {t("sessions.routines.title")}
          </ThemedText>
          {routineStatItems.map((item) => (
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
            {t("sessions.routineList.title")}
          </ThemedText>
          {routineList.length === 0 ? (
            <ThemedText style={[styles.empty, { color: subtleText }]}>
              {t("sessions.routineList.empty")}
            </ThemedText>
          ) : (
            routineList.map((routine) => (
              <View
                key={routine.id}
                style={[styles.routineItem, { borderBottomColor: borderColor }]}
              >
                <View style={styles.routineHeader}>
                  <ThemedText style={styles.routineTitle}>
                    {t("sessions.routineList.roundsLabel", {
                      count: routine.rounds,
                    })}{" "}
                    ·{" "}
                    {t("sessions.routineList.exercisesLabel", {
                      count: routine.exerciseCount,
                    })}
                  </ThemedText>
                  <ThemedText
                    style={[styles.routineSubtitle, { color: mutedText }]}
                  >
                    {formatDuration(routine.durationMs)} ·{" "}
                    {formatDate(routine.completedAt)} · {routine.totalReps}{" "}
                    {t("sessions.labels.reps")}
                  </ThemedText>
                </View>
                <View style={styles.routineActions}>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.actionButtonPrimary,
                      pressed ? { opacity: 0.8 } : null,
                    ]}
                    onPress={() => {
                      // Restart the routine from history
                      const sessionId = useRoutineSessionStore
                        .getState()
                        .restartFromSession(routine.id);
                      if (sessionId) {
                        const activeSession =
                          useRoutineSessionStore.getState().activeSession;
                        const firstStep = activeSession?.plan[0];
                        if (firstStep) {
                          router.push({
                            pathname: "/exercises/[exerciseId]",
                            params: {
                              exerciseId: firstStep.exerciseId,
                              routineId: sessionId,
                              stepIndex: "0",
                            },
                          });
                        }
                      }
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t("sessions.routineList.actions.start")}
                  >
                    <ThemedText
                      style={[
                        styles.actionButtonText,
                        styles.actionButtonTextPrimary,
                      ]}
                    >
                      {t("sessions.routineList.actions.start")}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.actionButtonSecondary,
                      { borderColor },
                      pressed ? { opacity: 0.6 } : null,
                    ]}
                    onPress={() => {
                      // Find the full session from history
                      const fullSession = routineHistory.find(
                        (s) => s.id === routine.id,
                      );
                      if (fullSession) {
                        // Apply the routine plan to the builder
                        const planBase = fullSession.plan.map((step) => ({
                          exerciseId: step.exerciseId,
                          targetReps: step.targetReps,
                        }));
                        applyPlan(planBase, fullSession.rounds);
                      }
                      // Navigate to routine builder
                      router.push("/routine");
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t("sessions.routineList.actions.edit")}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      {t("sessions.routineList.actions.edit")}
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    style={({ pressed }) => [
                      styles.actionButton,
                      styles.actionButtonSecondary,
                      { borderColor },
                      pressed ? { opacity: 0.6 } : null,
                    ]}
                    onPress={() => {
                      // TODO: Implement analyze functionality
                    }}
                    accessibilityRole="button"
                    accessibilityLabel={t(
                      "sessions.routineList.actions.analyze",
                    )}
                  >
                    <ThemedText style={styles.actionButtonText}>
                      {t("sessions.routineList.actions.analyze")}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            ))
          )}
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
