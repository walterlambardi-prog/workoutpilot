import { useCallback, useMemo } from "react";
import { useTheme } from "tamagui";

import { Colors } from "@/constants/theme";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

import {
    DEFAULT_GAP,
    DEFAULT_SQUARE_SIZE,
    DEFAULT_WEEKS,
} from "../ActivityHeatmap.styles";
import type {
    ActivityHeatmapDatum,
    HeatmapCell,
} from "../ActivityHeatmap.types";

const formatDateKey = (input: Date): string => {
  const year = input.getFullYear();
  const month = `${input.getMonth() + 1}`.padStart(2, "0");
  const day = `${input.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export const useActivityHeatmap = () => {
  const { currentSession, history: sessionHistory } = useExerciseSessionStore();
  const { history: routineHistory, lastCompletedSession } =
    useRoutineSessionStore();
  const weeks = DEFAULT_WEEKS;
  const squareSize = DEFAULT_SQUARE_SIZE;
  const gap = DEFAULT_GAP;
  const theme = useTheme();
  const baseColor =
    (theme.primary?.val as string | undefined) ?? Colors.light.tint;
  const backgroundColor =
    (theme.backgroundHover?.val as string | undefined) ??
    Colors.light.background;
  const borderColor =
    (theme.borderColor?.val as string | undefined) ?? Colors.light.icon;

  const routineSessions = useMemo(() => {
    const sessions = [...routineHistory];
    if (
      lastCompletedSession &&
      !sessions.find((session) => session.id === lastCompletedSession.id)
    ) {
      sessions.unshift(lastCompletedSession);
    }
    return sessions;
  }, [lastCompletedSession, routineHistory]);

  const data: ActivityHeatmapDatum[] = useMemo(() => {
    const map = new Map<string, { sessions: number; routines: number }>();
    const addEntry = (
      timestamp: number | undefined,
      type: "session" | "routine",
    ) => {
      if (!timestamp) return;
      const key = formatDateKey(new Date(timestamp));
      const current = map.get(key) ?? { sessions: 0, routines: 0 };
      const next =
        type === "session"
          ? { ...current, sessions: current.sessions + 1 }
          : { ...current, routines: current.routines + 1 };
      map.set(key, next);
    };

    sessionHistory.forEach((entry) =>
      addEntry(entry.endedAt ?? entry.startedAt, "session"),
    );
    if (currentSession) {
      addEntry(currentSession.endedAt ?? currentSession.startedAt, "session");
    }
    routineSessions.forEach((session) =>
      addEntry(session.completedAt ?? session.startedAt, "routine"),
    );

    return Array.from(map.entries()).map(
      ([date, counts]): ActivityHeatmapDatum => ({
        date,
        sessions: counts.sessions,
        routines: counts.routines,
      }),
    );
  }, [currentSession, routineSessions, sessionHistory]);

  const heatmap = useMemo(() => {
    const safeWeeks = Math.max(1, Math.floor(weeks));
    const totalDays = safeWeeks * 7;
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - (totalDays - 1));

    const aggregated = new Map<string, ActivityHeatmapDatum>();
    data.forEach((item) => {
      const existing = aggregated.get(item.date);
      aggregated.set(item.date, {
        date: item.date,
        sessions: (existing?.sessions ?? 0) + Math.max(0, item.sessions),
        routines: (existing?.routines ?? 0) + Math.max(0, item.routines),
      });
    });

    const cells: HeatmapCell[] = [];
    let maxValue = 0;
    let totalSessions = 0;
    let totalRoutines = 0;
    let totalReps = 0;
    let totalDurationMs = 0;

    for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + dayIndex);
      const key = formatDateKey(date);
      const counts = aggregated.get(key) ?? {
        sessions: 0,
        routines: 0,
        date: key,
      };
      const value = counts.sessions + counts.routines;

      maxValue = Math.max(maxValue, value);
      totalSessions += counts.sessions;
      totalRoutines += counts.routines;
      // Sum exercise session reps and duration for this date
      const exerciseEntries = sessionHistory.filter((entry) => {
        const ended = entry.endedAt ?? entry.startedAt;
        return formatDateKey(new Date(ended)) === key;
      });
      exerciseEntries.forEach((entry) => {
        totalReps += entry.reps ?? 0;
        const duration = entry.durationMs ?? 0;
        totalDurationMs += duration;
      });

      const routineEntries = routineHistory.filter((entry) => {
        const ended = entry.completedAt ?? entry.startedAt;
        return formatDateKey(new Date(ended)) === key;
      });
      routineEntries.forEach((entry) => {
        totalReps += entry.totalReps ?? 0;
        if (entry.completedAt && entry.startedAt) {
          totalDurationMs += Math.max(0, entry.completedAt - entry.startedAt);
        }
      });

      cells.push({
        key,
        date,
        weekIndex: Math.floor(dayIndex / 7),
        dayIndex: date.getDay(),
        value,
        sessions: counts.sessions,
        routines: counts.routines,
      });
    }

    return {
      cells,
      maxValue: Math.max(1, maxValue),
      totalSessions,
      totalRoutines,
      totalReps,
      totalDurationMs,
      width: safeWeeks * squareSize + (safeWeeks - 1) * gap,
      height: 7 * squareSize + 6 * gap,
    };
  }, [data, gap, routineHistory, sessionHistory, squareSize, weeks]);

  const colorForValue = useCallback(
    (value: number) => {
      if (value <= 0) {
        return { fill: backgroundColor, opacity: 1 };
      }

      const ratio = Math.min(1, value / heatmap.maxValue);
      if (ratio > 0.75) return { fill: baseColor, opacity: 0.95 };
      if (ratio > 0.5) return { fill: baseColor, opacity: 0.75 };
      if (ratio > 0.25) return { fill: baseColor, opacity: 0.55 };
      return { fill: baseColor, opacity: 0.35 };
    },
    [backgroundColor, baseColor, heatmap.maxValue],
  );

  const legendValues = useMemo(() => {
    const step = heatmap.maxValue / 4;
    return [0, step, step * 2, step * 3, heatmap.maxValue];
  }, [heatmap.maxValue]);

  const hasActivity = heatmap.totalSessions + heatmap.totalRoutines > 0;

  return {
    heatmap,
    legendValues,
    hasActivity,
    colorForValue,
    squareSize,
    gap,
    totals: {
      reps: heatmap.totalReps,
      durationMs: heatmap.totalDurationMs,
    },
    colors: {
      backgroundColor,
      borderColor,
    },
  } as const;
};

export default useActivityHeatmap;
