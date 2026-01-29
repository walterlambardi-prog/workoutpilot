import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Image } from "react-native";

import { EXERCISE_DEFINITION_MAP } from "@/app/exercises/exercises.data";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";
import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import {
  type RoutineSession,
  useRoutineSessionStore,
} from "@/stores/routineSessionStore";

import styles, { THUMB_SIZE } from "./sessions.styles";
import type { RoutineListItem, SessionListItem } from "./sessions.types";

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

const formatNumber = (value?: number) => {
  if (!value) return "0";
  return value.toLocaleString();
};

const StatTile: React.FC<{
  label: string;
  value: string;
  helper?: string;
}> = ({ label, value, helper }) => (
  <TCard gap="$2">
    <TText variant="label" color="$placeholderColor">
      {label}
    </TText>
    <THeading level={3}>{value}</THeading>
    {helper ? (
      <TText variant="caption" color="$placeholderColor">
        {helper}
      </TText>
    ) : null}
  </TCard>
);

const MetaPill: React.FC<{ label: string }> = ({ label }) => (
  <TRow
    backgroundColor="$backgroundHover"
    borderColor="$borderColor"
    borderWidth={1}
    borderRadius="$4"
    paddingHorizontal="$3"
    paddingVertical="$2"
    alignItems="center"
    gap="$2"
  >
    <TText variant="caption">{label}</TText>
  </TRow>
);

const EmptyState: React.FC<{ text: string }> = ({ text }) => (
  <TText variant="caption" color="$placeholderColor">
    {text}
  </TText>
);

const SessionsScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { currentSession, history } = useExerciseSessionStore();
  const applyPlan = useRoutineBuilderStore((state) => state.applyPlan);
  const { history: routineHistory, lastCompletedSession } =
    useRoutineSessionStore();

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

  const topExercise = useMemo(() => {
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

    return Object.entries(exerciseTotals).reduce(
      (best, [exerciseId, reps]) => {
        if (!best || reps > best.reps) {
          return { exerciseId: exerciseId as ExerciseId, reps };
        }
        return best;
      },
      null as { exerciseId: ExerciseId; reps: number } | null,
    );
  }, [history, routineSessions]);

  const bestSessionCopy = useMemo(() => {
    if (!totals.bestSession) return t("sessions.empty.bestSession");
    const exercise =
      EXERCISE_DEFINITION_MAP[totals.bestSession.exerciseId as ExerciseId];
    const reps = formatNumber(totals.bestSession.reps ?? 0);
    return `${t(`${exercise.copyKey}.title`)} · ${reps} ${t("sessions.labels.reps")}`;
  }, [t, totals.bestSession]);

  const lastSessionCopy = useMemo(() => {
    if (!totals.lastSession) return t("sessions.empty.lastSession");
    const exercise =
      EXERCISE_DEFINITION_MAP[totals.lastSession.exerciseId as ExerciseId];
    const endedAt = formatDate(
      totals.lastSession.endedAt ?? totals.lastSession.startedAt,
    );
    return `${t(`${exercise.copyKey}.title`)} · ${endedAt}`;
  }, [t, totals.lastSession]);

  const topExerciseCopy = useMemo(() => {
    if (!topExercise) return t("sessions.empty.topExercise");
    const exercise = EXERCISE_DEFINITION_MAP[topExercise.exerciseId];
    return `${t(`${exercise.copyKey}.title`)} · ${formatNumber(topExercise.reps)} ${t("sessions.labels.reps")}`;
  }, [t, topExercise]);

  const routineTopExerciseCopy = useMemo(() => {
    if (!routineTotals.topExercise) return t("sessions.routines.empty");
    const exercise =
      EXERCISE_DEFINITION_MAP[routineTotals.topExercise.exerciseId];
    return `${t(`${exercise.copyKey}.title`)} · ${formatNumber(
      routineTotals.topExercise.reps,
    )} ${t("sessions.labels.reps")}`;
  }, [routineTotals.topExercise, t]);

  const statHighlights = useMemo(
    () => [
      {
        key: "volume",
        label: t("sessions.stats.totalReps"),
        value: formatNumber(totals.totalReps),
        helper: `${t("sessions.stats.totalSessions")}: ${formatNumber(
          totals.totalSessions,
        )}`,
      },
      {
        key: "time",
        label: t("sessions.stats.totalDuration"),
        value: formatDuration(totals.totalDurationMs),
        helper: `${t("sessions.stats.averageReps")}: ${formatNumber(
          totals.averageReps,
        )}`,
      },
      {
        key: "coverage",
        label: t("sessions.stats.exercisesTracked"),
        value: formatNumber(totals.uniqueExercises),
        helper: topExerciseCopy,
      },
      {
        key: "recency",
        label: t("sessions.stats.bestSession"),
        value: bestSessionCopy,
        helper: lastSessionCopy,
      },
    ],
    [bestSessionCopy, lastSessionCopy, t, topExerciseCopy, totals],
  );

  const routineHighlights = useMemo(
    () => [
      {
        key: "routine-volume",
        label: t("sessions.routines.totalReps"),
        value: formatNumber(routineTotals.totalReps),
        helper: `${t("sessions.routines.totalSessions")}: ${formatNumber(
          routineTotals.totalSessions,
        )}`,
      },
      {
        key: "routine-time",
        label: t("sessions.routines.totalDuration"),
        value: formatDuration(routineTotals.totalDurationMs),
        helper: `${t("sessions.routines.averageReps")}: ${formatNumber(
          routineTotals.averageReps,
        )}`,
      },
      {
        key: "routine-top",
        label: t("sessions.routines.bestRoutine"),
        value: routineTotals.bestRoutine
          ? `${formatNumber(routineTotals.bestRoutine.totalReps ?? 0)} ${t("sessions.labels.reps")}`
          : t("sessions.routines.empty"),
        helper: routineTopExerciseCopy,
      },
    ],
    [routineTopExerciseCopy, routineTotals, t],
  );

  const recentHistory: SessionListItem[] = useMemo(
    () =>
      history.slice(0, 8).map((item): SessionListItem => {
        const copyKey =
          EXERCISE_DEFINITION_MAP[item.exerciseId as ExerciseId].copyKey;
        return {
          id: item.id,
          title: t(`${copyKey}.title`),
          subtitle: t("sessions.history.meta", {
            duration: formatDuration(item.durationMs),
            ended: formatDate(item.endedAt ?? item.startedAt),
          }),
          repsLabel: `${formatNumber(item.reps)} ${t("sessions.labels.reps")}`,
          durationLabel: `${t("sessions.labels.duration")}: ${formatDuration(
            item.durationMs,
          )}`,
          endedLabel: `${t("sessions.labels.ended")}: ${formatDate(
            item.endedAt ?? item.startedAt,
          )}`,
        };
      }),
    [history, t],
  );

  const routineList: RoutineListItem[] = useMemo(
    () =>
      routineHistory
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
        }),
    [routineHistory],
  );

  const filteredBreakdown = useMemo(
    () => breakdown.filter((item) => item.sessions > 0).slice(0, 8),
    [breakdown],
  );

  const handleStartRoutine = useCallback(
    (routineId: string) => {
      const sessionId = useRoutineSessionStore
        .getState()
        .restartFromSession(routineId);
      if (!sessionId) return;

      const activeSession = useRoutineSessionStore.getState().activeSession;
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
    },
    [router],
  );

  const handleEditRoutine = useCallback(
    (routineId: string) => {
      const fullSession = routineHistory.find(
        (session) => session.id === routineId,
      );
      if (fullSession) {
        const planBase = fullSession.plan.map((step) => ({
          exerciseId: step.exerciseId,
          targetReps: step.targetReps,
        }));
        applyPlan(planBase, fullSession.rounds);
      }
      router.push("/routine");
    },
    [applyPlan, routineHistory, router],
  );

  const handleAnalyzeRoutine = useCallback(
    (routineId: string) => {
      router.push({ pathname: "/routineAnalysis", params: { routineId } });
    },
    [router],
  );

  const handleViewRoutineSummary = useCallback(
    (routineId: string) => {
      router.push({
        pathname: "/routine/complete",
        params: { sessionId: routineId },
      });
    },
    [router],
  );

  return (
    <TPage backgroundColor="$background" hasHeader gap="$4">
      <ScreenHeader
        title={t("sessions.title")}
        subtitle={t("sessions.subtitle")}
      />

      <TGrid columns={3} gap="$3">
        {statHighlights.map((item) => (
          <StatTile
            key={item.key}
            label={item.label}
            value={item.value}
            helper={item.helper}
          />
        ))}
      </TGrid>

      <TCard gap="$3">
        <THeading level={3}>{t("sessions.routines.title")}</THeading>
        <TGrid columns={3} gap="$3">
          {routineHighlights.map((item) => (
            <StatTile
              key={item.key}
              label={item.label}
              value={item.value}
              helper={item.helper}
            />
          ))}
        </TGrid>
      </TCard>

      <TCard gap="$3">
        <THeading level={3}>{t("sessions.breakdown.title")}</THeading>
        {filteredBreakdown.length === 0 ? (
          <EmptyState text={t("sessions.breakdown.never")} />
        ) : (
          <TStack gap="$3">
            {filteredBreakdown.map((item) => (
              <TRow key={item.definition.id} gap="$3" alignItems="center">
                <TStack
                  width={THUMB_SIZE}
                  height={THUMB_SIZE}
                  borderRadius="$4"
                  overflow="hidden"
                  borderWidth={1}
                  borderColor="$borderColor"
                  backgroundColor="$backgroundHover"
                >
                  <Image
                    source={item.definition.image}
                    style={styles.thumbImage}
                    resizeMode="cover"
                  />
                </TStack>
                <TStack flex={1} gap="$1" minWidth={0}>
                  <TText variant="label">
                    {t(`${item.definition.copyKey}.title`)}
                  </TText>
                  <TRow gap="$2" flexWrap="wrap">
                    <MetaPill
                      label={t("sessions.breakdown.sessionsLabel", {
                        count: item.sessions,
                      })}
                    />
                    <MetaPill label={formatDuration(item.totalDuration)} />
                  </TRow>
                  <TText variant="caption" color="$placeholderColor">
                    {item.last
                      ? t("sessions.breakdown.last", {
                          date: formatDate(
                            item.last.endedAt ?? item.last.startedAt,
                          ),
                        })
                      : t("sessions.breakdown.never")}
                  </TText>
                </TStack>
                <TStack alignItems="flex-end" gap="$1">
                  <THeading level={4}>{formatNumber(item.reps)}</THeading>
                  <TText variant="caption" color="$placeholderColor">
                    {t("sessions.labels.reps")}
                  </TText>
                </TStack>
              </TRow>
            ))}
          </TStack>
        )}
      </TCard>

      <TCard gap="$3">
        <THeading level={3}>{t("sessions.routineList.title")}</THeading>
        {routineList.length === 0 ? (
          <EmptyState text={t("sessions.routineList.empty")} />
        ) : (
          <TGrid columns={3} gap="$3">
            {routineList.map((routine) => (
              <TCard
                key={routine.id}
                gap="$3"
                onPress={() => handleViewRoutineSummary(routine.id)}
                pressStyle={{ scale: 0.99 }}
              >
                <TStack gap="$1">
                  <TText variant="label">
                    {t("sessions.routineList.roundsLabel", {
                      count: routine.rounds,
                    })}
                    {" · "}
                    {t("sessions.routineList.exercisesLabel", {
                      count: routine.exerciseCount,
                    })}
                  </TText>
                  <TRow gap="$2" flexWrap="wrap">
                    <MetaPill
                      label={`${t("sessions.labels.reps")}: ${formatNumber(
                        routine.totalReps,
                      )}`}
                    />
                    <MetaPill
                      label={`${t("sessions.labels.duration")}: ${formatDuration(
                        routine.durationMs,
                      )}`}
                    />
                    <MetaPill label={formatDate(routine.completedAt)} />
                  </TRow>
                </TStack>

                <TRow gap="$2" flexWrap="wrap">
                  <TButton
                    variant="primary"
                    fullWidth
                    onPress={() => handleStartRoutine(routine.id)}
                    accessibilityLabel={t("sessions.routineList.actions.start")}
                  >
                    {t("sessions.routineList.actions.start")}
                  </TButton>
                  <TButton
                    variant="outline"
                    fullWidth
                    onPress={() => handleEditRoutine(routine.id)}
                    accessibilityLabel={t("sessions.routineList.actions.edit")}
                  >
                    {t("sessions.routineList.actions.edit")}
                  </TButton>
                  <TButton
                    variant="ghost"
                    fullWidth
                    iconAfterName="sparkles-outline"
                    onPress={() => handleAnalyzeRoutine(routine.id)}
                    accessibilityLabel={t(
                      "sessions.routineList.actions.analyze",
                    )}
                  >
                    {t("sessions.routineList.actions.analyze")}
                  </TButton>
                </TRow>
              </TCard>
            ))}
          </TGrid>
        )}
      </TCard>

      <TCard gap="$3">
        <THeading level={3}>{t("sessions.history.title")}</THeading>
        {recentHistory.length === 0 ? (
          <EmptyState text={t("sessions.history.empty")} />
        ) : (
          <TStack gap="$3">
            {recentHistory.map((item) => (
              <TStack
                key={item.id}
                gap="$2"
                borderTopWidth={1}
                borderColor="$borderColor"
                paddingTop="$3"
              >
                <THeading level={4}>{item.title}</THeading>
                <TRow gap="$2" flexWrap="wrap">
                  <MetaPill label={item.repsLabel} />
                  {item.durationLabel ? (
                    <MetaPill label={item.durationLabel} />
                  ) : null}
                  {item.endedLabel ? (
                    <MetaPill label={item.endedLabel} />
                  ) : null}
                </TRow>
                <TText variant="caption" color="$placeholderColor">
                  {item.subtitle}
                </TText>
              </TStack>
            ))}
          </TStack>
        )}
      </TCard>
    </TPage>
  );
};

export default SessionsScreen;
