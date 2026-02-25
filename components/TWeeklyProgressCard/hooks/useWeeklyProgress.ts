import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import {
    EXERCISE_CATEGORIES,
    EXERCISE_COPY_KEYS,
    ExerciseCategory,
    type ExerciseId,
} from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { useStepTrackerStore } from "@/stores/stepTrackerStore";

import type {
    CategoryBreakdown,
    CategoryColorScheme,
    DailyActivity,
    PersonalRecord,
    WeekSummary,
    WeeklyProgressData,
} from "../TWeeklyProgressCard.types";

/** Maximum pixel height for a bar in the chart */
const BAR_CHART_MAX_HEIGHT = 100;
/** Minimum visible bar height when there's activity */
const BAR_MIN_HEIGHT = 6;

const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

const CATEGORY_COLOR_MAP: Record<string, CategoryColorScheme> = {
  [ExerciseCategory.LEGS]: "blue",
  [ExerciseCategory.ARMS]: "purple",
  [ExerciseCategory.CHEST]: "green",
  [ExerciseCategory.CORE]: "blue",
  [ExerciseCategory.CARDIO]: "orange",
};

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Returns the Monday 00:00:00.000 of the week containing `date`.
 */
const getWeekStartMs = (date: Date): number => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const dow = d.getDay(); // 0=Sun … 6=Sat
  const diff = dow === 0 ? 6 : dow - 1; // days since Monday
  d.setDate(d.getDate() - diff);
  return d.getTime();
};

/**
 * Convert a timestamp to a Mon=0 … Sun=6 index.
 */
const toDayIndex = (ts: number): number => {
  const dow = new Date(ts).getDay();
  return dow === 0 ? 6 : dow - 1;
};

const inRange = (ts: number, startMs: number, endMs: number): boolean =>
  ts >= startMs && ts < endMs;

/**
 * Hook that computes weekly fitness progress data from all three activity
 * stores (exercises, routines, step tracker).
 *
 * All returned strings are already translated via `t()`.
 */
export const useWeeklyProgress = (): WeeklyProgressData => {
  const { t } = useTranslation();

  const exerciseHistory = useExerciseSessionStore((s) => s.history);
  const routineHistory = useRoutineSessionStore((s) => s.history);
  const stepTrackerHistory = useStepTrackerStore((s) => s.history);

  return useMemo(() => {
    const now = new Date();
    const weekStartMs = getWeekStartMs(now);
    const prevWeekStartMs = weekStartMs - 7 * MS_PER_DAY;
    const weekEndMs = weekStartMs + 7 * MS_PER_DAY;

    // Today index (Mon=0 … Sun=6)
    const todayIdx = toDayIndex(now.getTime());

    // ── Daily buckets ────────────────────────────────────────────────
    const daily: DailyActivity[] = DAY_KEYS.map((dayKey, idx) => {
      const dayDate = new Date(weekStartMs + idx * MS_PER_DAY);
      return {
        dayKey,
        dayNumber: dayDate.getDate(),
        totalReps: 0,
        totalMinutes: 0,
        totalSteps: 0,
        sessions: 0,
        activityScore: 0,
        barHeight: 0,
        isToday: idx === todayIdx,
        isFuture: idx > todayIdx,
      };
    });

    // ── Week summaries ───────────────────────────────────────────────
    const curWeek: WeekSummary = {
      totalReps: 0,
      totalMinutes: 0,
      totalSessions: 0,
      totalSteps: 0,
    };
    const prevWeek: WeekSummary = {
      totalReps: 0,
      totalMinutes: 0,
      totalSessions: 0,
      totalSteps: 0,
    };

    // ── Accumulators ─────────────────────────────────────────────────
    const categoryCounts: Record<string, number> = {};
    let bestSessionReps = 0;
    let bestSessionExerciseId: string | null = null;
    let totalAllTimeReps = 0;
    let longestWalkSteps = 0;
    let longestWalkKm = 0;
    const exerciseFrequency: Record<string, number> = {};

    // ── Exercise sessions ────────────────────────────────────────────
    for (const s of exerciseHistory) {
      const ts = s.endedAt ?? s.startedAt;
      const reps = s.reps;
      const mins = (s.durationMs ?? 0) / 60000;
      const isStandalone = !s.routineId;

      totalAllTimeReps += reps;

      if (isStandalone) {
        const cat =
          EXERCISE_CATEGORIES[s.exerciseId as ExerciseId] ?? undefined;
        if (cat) categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;

        exerciseFrequency[s.exerciseId] =
          (exerciseFrequency[s.exerciseId] ?? 0) + 1;

        if (reps > bestSessionReps) {
          bestSessionReps = reps;
          bestSessionExerciseId = s.exerciseId;
        }
      }

      if (inRange(ts, weekStartMs, weekEndMs) && isStandalone) {
        const di = toDayIndex(ts);
        daily[di].totalReps += reps;
        daily[di].totalMinutes += mins;
        daily[di].sessions++;
        curWeek.totalReps += reps;
        curWeek.totalMinutes += mins;
        curWeek.totalSessions++;
      } else if (inRange(ts, prevWeekStartMs, weekStartMs) && isStandalone) {
        prevWeek.totalReps += reps;
        prevWeek.totalMinutes += mins;
        prevWeek.totalSessions++;
      }
    }

    // ── Routine sessions ─────────────────────────────────────────────
    for (const s of routineHistory) {
      const ts = s.completedAt ?? s.startedAt;
      const reps = s.totalReps;
      const dur =
        s.stepResults?.reduce((acc, r) => acc + r.durationMs, 0) ??
        (s.completedAt ? s.completedAt - s.startedAt : 0);
      const mins = dur / 60000;

      totalAllTimeReps += reps;

      // Count categories from routine plan steps
      if (s.plan) {
        for (const step of s.plan) {
          const cat =
            EXERCISE_CATEGORIES[step.exerciseId as ExerciseId] ?? undefined;
          if (cat) categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
        }
      }

      if (inRange(ts, weekStartMs, weekEndMs)) {
        const di = toDayIndex(ts);
        daily[di].totalReps += reps;
        daily[di].totalMinutes += mins;
        daily[di].sessions++;
        curWeek.totalReps += reps;
        curWeek.totalMinutes += mins;
        curWeek.totalSessions++;
      } else if (inRange(ts, prevWeekStartMs, weekStartMs)) {
        prevWeek.totalReps += reps;
        prevWeek.totalMinutes += mins;
        prevWeek.totalSessions++;
      }
    }

    // ── Step tracker sessions ────────────────────────────────────────
    for (const s of stepTrackerHistory) {
      const ts = s.endedAt;
      const mins = s.durationMs / 60000;

      if (s.steps > longestWalkSteps) {
        longestWalkSteps = s.steps;
        longestWalkKm = s.distanceKm;
      }

      categoryCounts[ExerciseCategory.CARDIO] =
        (categoryCounts[ExerciseCategory.CARDIO] ?? 0) + 1;

      if (inRange(ts, weekStartMs, weekEndMs)) {
        const di = toDayIndex(ts);
        daily[di].totalSteps += s.steps;
        daily[di].totalMinutes += mins;
        daily[di].sessions++;
        curWeek.totalSteps += s.steps;
        curWeek.totalMinutes += mins;
        curWeek.totalSessions++;
      } else if (inRange(ts, prevWeekStartMs, weekStartMs)) {
        prevWeek.totalSteps += s.steps;
        prevWeek.totalMinutes += mins;
        prevWeek.totalSessions++;
      }
    }

    // ── Activity scores & bar heights ────────────────────────────────
    for (const d of daily) {
      d.activityScore =
        d.totalReps +
        Math.round(d.totalMinutes * 3) +
        Math.round(d.totalSteps / 100);
    }

    const maxScore = Math.max(...daily.map((d) => d.activityScore), 1);
    for (const d of daily) {
      d.barHeight =
        d.activityScore > 0
          ? Math.max(
              Math.round((d.activityScore / maxScore) * BAR_CHART_MAX_HEIGHT),
              BAR_MIN_HEIGHT,
            )
          : 0;
    }

    // ── Trend ────────────────────────────────────────────────────────
    const score = (w: WeekSummary) =>
      w.totalReps +
      Math.round(w.totalMinutes * 3) +
      Math.round(w.totalSteps / 100);

    const curScore = score(curWeek);
    const prevScore = score(prevWeek);
    const trendPercentage =
      prevScore > 0
        ? Math.round(((curScore - prevScore) / prevScore) * 100)
        : curScore > 0
          ? 100
          : 0;

    // ── Category breakdown (all-time) ────────────────────────────────
    const totalCatSessions = Object.values(categoryCounts).reduce(
      (a, b) => a + b,
      0,
    );
    const categoryBreakdown: CategoryBreakdown[] = Object.entries(
      categoryCounts,
    )
      .sort(([, a], [, b]) => b - a)
      .map(([cat, count]) => ({
        category: cat,
        translationKey: `home.weeklyProgress.categories.${cat}`,
        sessionCount: count,
        percentage:
          totalCatSessions > 0
            ? Math.round((count / totalCatSessions) * 100)
            : 0,
        colorScheme: CATEGORY_COLOR_MAP[cat] ?? "blue",
      }));

    // ── Personal records ─────────────────────────────────────────────
    const records: PersonalRecord[] = [];

    if (bestSessionReps > 0 && bestSessionExerciseId) {
      const copyKey =
        EXERCISE_COPY_KEYS[bestSessionExerciseId as ExerciseId] ?? null;
      const name = copyKey ? t(`${copyKey}.title`) : bestSessionExerciseId;
      records.push({
        type: "bestSession",
        icon: "trophy-outline",
        label: t("home.weeklyProgress.bestSession"),
        value: t("home.weeklyProgress.bestSessionValue", {
          reps: bestSessionReps,
          exercise: name,
        }),
        colorScheme: "blue",
      });
    }

    if (totalAllTimeReps > 0) {
      records.push({
        type: "totalAllTime",
        icon: "flame-outline",
        label: t("home.weeklyProgress.totalAllTime"),
        value: t("home.weeklyProgress.totalAllTimeValue", {
          count: totalAllTimeReps,
        }),
        colorScheme: "purple",
      });
    }

    if (longestWalkSteps > 0) {
      records.push({
        type: "longestWalk",
        icon: "walk-outline",
        label: t("home.weeklyProgress.longestWalk"),
        value: t("home.weeklyProgress.longestWalkValue", {
          steps: longestWalkSteps.toLocaleString(),
          km: longestWalkKm.toFixed(1),
        }),
        colorScheme: "orange",
      });
    }

    const topEntry = Object.entries(exerciseFrequency).sort(
      ([, a], [, b]) => b - a,
    )[0];
    if (topEntry) {
      const [exId, cnt] = topEntry;
      const copyKey = EXERCISE_COPY_KEYS[exId as ExerciseId] ?? null;
      const name = copyKey ? t(`${copyKey}.title`) : exId;
      records.push({
        type: "topExercise",
        icon: "star-outline",
        label: t("home.weeklyProgress.topExercise"),
        value: t("home.weeklyProgress.topExerciseValue", {
          exercise: name,
          count: cnt,
        }),
        colorScheme: "green",
      });
    }

    // ── Round minutes ────────────────────────────────────────────────
    curWeek.totalMinutes = Math.round(curWeek.totalMinutes);
    prevWeek.totalMinutes = Math.round(prevWeek.totalMinutes);

    const hasData =
      exerciseHistory.length > 0 ||
      routineHistory.length > 0 ||
      stepTrackerHistory.length > 0;

    return {
      dailyActivity: daily,
      currentWeek: curWeek,
      previousWeek: prevWeek,
      trendPercentage,
      categoryBreakdown,
      personalRecords: records,
      hasData,
      hasWeekData: curWeek.totalSessions > 0,
    };
  }, [exerciseHistory, routineHistory, stepTrackerHistory, t]);
};
