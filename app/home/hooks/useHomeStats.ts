import { useMemo } from "react";
import { useTranslation } from "react-i18next";

import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { useStepTrackerStore } from "@/stores/stepTrackerStore";

export interface TodayStats {
  totalReps: number;
  sessionsCompleted: number;
  totalMinutes: number;
  stepsWalked: number;
}

export interface StreakInfo {
  currentStreak: number;
  activeDays: number[];
  longestStreak: number;
}

export interface NextAction {
  type: "continue-routine" | "suggested-exercise" | "none";
  title: string;
  subtitle: string;
  progress?: number;
  routineId?: string;
  exerciseId?: string;
  isActiveSession?: boolean; // true = active routine (can cancel), false = completed routine (restart)
}

export interface Achievement {
  id: string;
  type: "record" | "streak" | "milestone";
  title: string;
  description: string;
  icon: string;
  timestamp: number;
}

export const useHomeStats = () => {
  const { t } = useTranslation();

  // Get data from stores
  const exerciseHistory = useExerciseSessionStore((state) => state.history);
  const routineHistory = useRoutineSessionStore((state) => state.history);
  const activeRoutine = useRoutineSessionStore((state) => state.activeSession);
  const lastCompletedRoutine = useRoutineSessionStore(
    (state) => state.lastCompletedSession,
  );
  const stepTrackerHistory = useStepTrackerStore((state) => state.history);

  // Calculate today's stats
  const todayStats = useMemo((): TodayStats => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const tomorrowMs = todayMs + 24 * 60 * 60 * 1000;

    // Exercise sessions completed today (EXCLUDE exercises that are part of a routine)
    const todayExercises = exerciseHistory.filter(
      (session) =>
        session.endedAt &&
        session.endedAt >= todayMs &&
        session.endedAt < tomorrowMs &&
        !session.routineId, // Only count standalone exercises
    );

    // Routine sessions completed today
    const todayRoutines = routineHistory.filter(
      (session) =>
        session.completedAt &&
        session.completedAt >= todayMs &&
        session.completedAt < tomorrowMs,
    );

    // Step tracker sessions completed today (only count if both started AND ended today)
    const todaySteps = stepTrackerHistory.filter(
      (session) =>
        session.startedAt >= todayMs &&
        session.endedAt >= todayMs &&
        session.endedAt < tomorrowMs,
    );

    // Total reps from exercises and routines
    const totalReps =
      todayExercises.reduce((sum, session) => sum + session.reps, 0) +
      todayRoutines.reduce((sum, session) => sum + session.totalReps, 0);

    // Total minutes using actual duration (durationMs field)
    const totalMinutes = Math.round(
      (todayExercises.reduce(
        (sum, session) => sum + (session.durationMs || 0),
        0,
      ) +
        todayRoutines.reduce((sum, session) => {
          // Use stepResults for accurate duration, fallback to completedAt - startedAt
          const routineDuration =
            session.stepResults?.reduce(
              (acc, step) => acc + step.durationMs,
              0,
            ) ||
            (session.completedAt ? session.completedAt - session.startedAt : 0);
          return sum + routineDuration;
        }, 0) +
        todaySteps.reduce((sum, session) => sum + session.durationMs, 0)) /
        60000,
    );

    const sessionsCompleted =
      todayExercises.length + todayRoutines.length + todaySteps.length;

    const stepsWalked = todaySteps.reduce(
      (sum, session) => sum + session.steps,
      0,
    );

    return { totalReps, sessionsCompleted, totalMinutes, stepsWalked };
  }, [exerciseHistory, routineHistory, stepTrackerHistory]);

  // Calculate streak
  const streakInfo = useMemo((): StreakInfo => {
    // Combine all sessions with timestamps (EXCLUDE exercises that are part of a routine)
    const allSessions = [
      ...exerciseHistory
        .filter((s) => !s.routineId) // Only count standalone exercises
        .map((s) => s.endedAt || s.startedAt),
      ...routineHistory.map((s) => s.completedAt || s.startedAt),
      ...stepTrackerHistory.map((s) => s.endedAt),
    ].filter(Boolean);

    if (allSessions.length === 0) {
      return { currentStreak: 0, activeDays: [], longestStreak: 0 };
    }

    // Get unique days with activity
    const uniqueDays = Array.from(
      new Set(
        allSessions.map((timestamp) => {
          const date = new Date(timestamp);
          date.setHours(0, 0, 0, 0);
          return date.getTime();
        }),
      ),
    ).sort((a, b) => b - a); // Most recent first

    // Calculate current streak
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    let currentStreak = 0;
    let checkDate = todayMs;

    for (const dayMs of uniqueDays) {
      if (dayMs === checkDate) {
        currentStreak++;
        checkDate -= 24 * 60 * 60 * 1000; // Go back one day
      } else if (dayMs < checkDate) {
        break; // Streak broken
      }
    }

    // Calculate longest streak
    let longestStreak = 0;
    let tempStreak = 0;
    let lastDay = uniqueDays[0];

    for (let i = 0; i < uniqueDays.length; i++) {
      const currentDay = uniqueDays[i];

      if (i === 0 || lastDay - currentDay === 24 * 60 * 60 * 1000) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 1;
      }

      lastDay = currentDay;
    }

    return {
      currentStreak,
      activeDays: uniqueDays,
      longestStreak: Math.max(longestStreak, currentStreak),
    };
  }, [exerciseHistory, routineHistory, stepTrackerHistory]);

  // Determine next action
  const nextAction = useMemo((): NextAction => {
    // Priority 1: Active routine
    if (activeRoutine) {
      const completedSteps = activeRoutine.currentStepIndex;
      const totalSteps = activeRoutine.plan.length;
      const progress = (completedSteps / totalSteps) * 100;

      return {
        type: "continue-routine",
        title: t("home.nextAction.continueRoutineTitle"),
        subtitle: t("home.nextAction.continueRoutineSubtitle", {
          completed: completedSteps,
          total: totalSteps,
        }),
        progress,
        routineId: activeRoutine.id,
        isActiveSession: true, // Active session - can cancel
      };
    }

    // Priority 2: Last completed routine (restart)
    if (lastCompletedRoutine) {
      // Count unique exercises (not total steps)
      const uniqueExercises = new Set(
        lastCompletedRoutine.plan.map((step) => step.exerciseId),
      ).size;

      return {
        type: "continue-routine",
        title: t("home.nextAction.restartRoutineTitle"),
        subtitle: t("home.nextAction.restartRoutineSubtitle", {
          exercises: uniqueExercises,
          rounds: lastCompletedRoutine.rounds,
        }),
        routineId: lastCompletedRoutine.id,
        isActiveSession: false, // Completed routine - restart only, no cancel
      };
    }

    // Priority 3: Suggest most frequent exercise (only standalone exercises)
    const standaloneExercises = exerciseHistory.filter((s) => !s.routineId);

    if (standaloneExercises.length > 0) {
      const exerciseCounts: Record<string, number> = {};
      standaloneExercises.forEach((session) => {
        exerciseCounts[session.exerciseId] =
          (exerciseCounts[session.exerciseId] || 0) + 1;
      });

      const mostFrequent = Object.entries(exerciseCounts).sort(
        ([, a], [, b]) => b - a,
      )[0];

      if (mostFrequent) {
        const [exerciseId, count] = mostFrequent;
        return {
          type: "suggested-exercise",
          title: t("home.nextAction.suggestedExerciseTitle"),
          subtitle: t("home.nextAction.suggestedExerciseSubtitle", {
            exerciseId,
            count,
          }),
          exerciseId,
        };
      }
    }

    return {
      type: "none",
      title: t("home.nextAction.startFirstWorkoutTitle"),
      subtitle: t("home.nextAction.startFirstWorkoutSubtitle"),
    };
  }, [activeRoutine, lastCompletedRoutine, exerciseHistory, t]);

  // Detect recent achievements
  const latestAchievement = useMemo((): Achievement | null => {
    const achievements: Achievement[] = [];

    // Check for new personal records (most reps in a session)
    if (exerciseHistory.length > 0) {
      const sortedByReps = [...exerciseHistory].sort((a, b) => b.reps - a.reps);
      const topSession = sortedByReps[0];

      if (topSession && topSession.endedAt) {
        const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
        if (topSession.endedAt >= oneDayAgo) {
          achievements.push({
            id: `record-${topSession.id}`,
            type: "record",
            title: t("home.achievement.personalRecordTitle"),
            description: t("home.achievement.personalRecordDescription", {
              reps: topSession.reps,
              exerciseId: topSession.exerciseId,
            }),
            icon: "🏆",
            timestamp: topSession.endedAt,
          });
        }
      }
    }

    // Check for streak milestones
    if (streakInfo.currentStreak >= 3 && streakInfo.currentStreak <= 7) {
      achievements.push({
        id: `streak-${streakInfo.currentStreak}`,
        type: "streak",
        title: t("home.achievement.streakTitle", {
          count: streakInfo.currentStreak,
        }),
        description: t("home.achievement.streakDescriptionOnFire"),
        icon: "🔥",
        timestamp: Date.now(),
      });
    } else if (streakInfo.currentStreak >= 7) {
      achievements.push({
        id: `streak-${streakInfo.currentStreak}`,
        type: "streak",
        title: t("home.achievement.streakTitle", {
          count: streakInfo.currentStreak,
        }),
        description: t("home.achievement.streakDescriptionIncredible"),
        icon: "⭐",
        timestamp: Date.now(),
      });
    }

    // Check for total reps milestones
    const totalAllTimeReps =
      exerciseHistory.reduce((sum, session) => sum + session.reps, 0) +
      routineHistory.reduce((sum, session) => sum + session.totalReps, 0);

    const milestones = [100, 500, 1000, 5000, 10000];
    for (const milestone of milestones) {
      if (totalAllTimeReps >= milestone && totalAllTimeReps < milestone + 50) {
        achievements.push({
          id: `milestone-${milestone}`,
          type: "milestone",
          title: t("home.achievement.milestoneTitle", { count: milestone }),
          description: t("home.achievement.milestoneDescription"),
          icon: "💪",
          timestamp: Date.now(),
        });
      }
    }

    // Return most recent
    return achievements.length > 0 ? achievements[0] : null;
  }, [exerciseHistory, routineHistory, streakInfo, t]);

  return {
    todayStats,
    streakInfo,
    nextAction,
    latestAchievement,
  };
};
