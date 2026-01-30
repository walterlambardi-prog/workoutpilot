import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TGrid } from "@/components/TGrid";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { TTag } from "@/components/TTag";
import { THeading, TText } from "@/components/TText";
import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import {
  useRoutineSessionStore,
  type RoutineSession,
  type RoutineStepResult,
} from "@/stores/routineSessionStore";

import {
  ActionsRow,
  HeroCard,
  HighlightRow,
  RoundCard,
  RoundHeader,
  RoundMetaRow,
  RoundsStack,
  StatCard,
  StepRow,
  StepRowLast,
  StepsStack,
  SummaryCard,
} from "./complete.styles";
import type { RoutineCompleteScreenProps } from "./complete.types";

const formatDuration = (ms: number | null) => {
  if (!ms || ms <= 0) return "--";
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) return `${seconds}s`;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
};

const formatNumber = (value: number) => new Intl.NumberFormat().format(value);

const RoutineCompleteScreen: React.FC<RoutineCompleteScreenProps> = () => {
  const router = useRouter();
  const { t } = useTranslation();
  const { sessionId } = useLocalSearchParams<{ sessionId?: string }>();

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

  const handleAnalyzeRoutine = () => {
    router.push({
      pathname: "/routineAnalysis",
      params: { routineId: session.id },
    });
  };

  const stats = [
    {
      key: "reps",
      label: t("routineComplete.stats.totalReps"),
      value: formatNumber(totalReps),
    },
    {
      key: "duration",
      label: t("routineComplete.stats.duration"),
      value: duration,
    },
    {
      key: "rounds",
      label: t("routineComplete.stats.rounds"),
      value: formatNumber(session.rounds),
    },
    {
      key: "exercises",
      label: t("routineComplete.stats.exercises"),
      value: formatNumber(uniqueExercises),
    },
  ];

  const highlightTags = [
    {
      key: "duration",
      label: t("routineComplete.summary.roundDuration", { duration }),
      iconName: "time-outline" as const,
      tone: "primary" as const,
    },
    {
      key: "rounds",
      label: `${t("routineComplete.stats.rounds")}: ${session.rounds}`,
      iconName: "repeat-outline" as const,
      tone: "neutral" as const,
    },
    {
      key: "exercises",
      label: `${t("routineComplete.stats.exercises")}: ${uniqueExercises}`,
      iconName: "barbell-outline" as const,
      tone: "neutral" as const,
    },
  ];

  const actionButtons = [
    {
      key: "repeat",
      label: t("routineComplete.actions.repeat"),
      onPress: handleRepeat,
      variant: "primary" as const,
      iconName: "refresh" as const,
    },
    {
      key: "analyze",
      label: t("routineComplete.actions.analyze"),
      onPress: handleAnalyzeRoutine,
      variant: "secondary" as const,
      iconName: "analytics-outline" as const,
    },
    {
      key: "backToRoutine",
      label: t("routineComplete.actions.backToRoutine"),
      onPress: handleBackToRoutine,
      variant: "outline" as const,
      iconName: "list-outline" as const,
    },
  ];

  return (
    <TPage scrollable hasHeader>
      <ScreenHeader
        title={t("routineComplete.navTitle")}
        subtitle={t("routineComplete.subtitle", { rounds: session.rounds })}
      />

      <HeroCard>
        <THeading level={2}>{t("routineComplete.title")}</THeading>
        <TText opacity={0.85}>{t("routineComplete.encourage")}</TText>
        <HighlightRow>
          {highlightTags.map((tag) => (
            <TTag
              key={tag.key}
              label={tag.label}
              tone={tag.tone}
              iconName={tag.iconName}
              accessibilityLabel={tag.label}
            />
          ))}
        </HighlightRow>
      </HeroCard>

      <TGrid columns={2} gap="$3">
        {stats.map((stat) => (
          <StatCard key={stat.key}>
            <TText variant="label" opacity={0.8}>
              {stat.label}
            </TText>
            <THeading level={3}>{stat.value}</THeading>
          </StatCard>
        ))}
      </TGrid>

      <ActionsRow>
        {actionButtons.map((action) => (
          <TStack key={action.key} flex={1} minWidth="46%">
            <TButton
              fullWidth
              variant={action.variant}
              iconName={action.iconName}
              accessibilityLabel={action.label}
              onPress={action.onPress}
            >
              {action.label}
            </TButton>
          </TStack>
        ))}
      </ActionsRow>

      <SummaryCard>
        <RoundHeader>
          <TStack gap="$1" flex={1} minWidth={0}>
            <THeading level={3}>{t("routineComplete.summary.title")}</THeading>
            <TText variant="caption">{t("routineComplete.encourage")}</TText>
          </TStack>
          <RoundMetaRow>
            <TTag
              tone="neutral"
              iconName="time-outline"
              label={t("routineComplete.summary.roundDuration", {
                duration,
              })}
            />
            <TTag
              tone="neutral"
              iconName="barbell-outline"
              label={`${formatNumber(totalReps)} ${t(
                "routineComplete.stats.totalReps",
              )}`}
            />
          </RoundMetaRow>
        </RoundHeader>

        <RoundsStack>
          {groupedRounds.map((group) => (
            <RoundCard key={`round-${group.round}`}>
              <RoundHeader>
                <TStack gap="$1" flex={1} minWidth={0}>
                  <THeading level={4}>
                    {t("routineComplete.summary.round", {
                      round: group.round,
                    })}
                  </THeading>
                  <TText variant="caption">
                    {t("routineComplete.summary.roundMeta", {
                      count: group.steps.length,
                      reps: group.totalReps,
                    })}
                  </TText>
                </TStack>
                <RoundMetaRow>
                  <TTag
                    tone="neutral"
                    iconName="time-outline"
                    label={t("routineComplete.summary.roundDuration", {
                      duration: formatDuration(group.totalDurationMs),
                    })}
                  />
                  <TTag
                    tone="neutral"
                    iconName="barbell-outline"
                    label={`${formatNumber(group.totalReps)} ${t(
                      "routineComplete.stats.totalReps",
                    )}`}
                  />
                </RoundMetaRow>
              </RoundHeader>

              <StepsStack>
                {group.steps.map((step, index) => {
                  const exerciseTitle = t(
                    `${EXERCISE_COPY_KEYS[step.exerciseId]}.title`,
                  );
                  const isLast = index === group.steps.length - 1;
                  const StepComponent = isLast ? StepRowLast : StepRow;

                  return (
                    <StepComponent
                      key={`${step.stepIndex}-${step.exerciseId}`}
                      accessibilityRole="text"
                    >
                      <TStack flex={1} gap="$1" minWidth={0}>
                        <TText fontWeight="700">{exerciseTitle}</TText>
                        <TText variant="caption">
                          {t("routineComplete.summary.meta", {
                            round: step.round,
                            reps: step.reps,
                            target: step.targetReps,
                          })}
                        </TText>
                      </TStack>
                      <TRow gap="$2" alignItems="center">
                        <TTag
                          tone="neutral"
                          iconName="repeat-outline"
                          label={formatNumber(step.reps)}
                          accessibilityLabel={t(
                            "routineComplete.stats.totalReps",
                          )}
                        />
                        <TTag
                          tone="neutral"
                          iconName="time-outline"
                          label={formatDuration(step.durationMs)}
                          accessibilityLabel={t(
                            "routineComplete.summary.roundDuration",
                            { duration: formatDuration(step.durationMs) },
                          )}
                        />
                      </TRow>
                    </StepComponent>
                  );
                })}
              </StepsStack>
            </RoundCard>
          ))}
        </RoundsStack>
      </SummaryCard>
    </TPage>
  );
};

export default RoutineCompleteScreen;
