import { analyzeRoutine } from "@/app/routineAnalysis/routineAnalysis.service";
import type { ExerciseId } from "@/constants/exercises";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
    ExercisePerformance,
    RoutineAnalysisRequest,
    RoutineAnalysisResponse,
} from "../routineAnalysis.types";

export const useRoutineAnalysis = (routineId: string | undefined) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<RoutineAnalysisResponse | null>(
    null,
  );

  const { history, getAnalysis, saveAnalysis } = useRoutineSessionStore();

  const { t, i18n } = useTranslation();

  const getScoreColor = useCallback((score: number) => {
    if (score >= 80) return "$success" as const;
    if (score >= 60) return "$warning" as const;
    return "$error" as const;
  }, []);

  const performAnalysis = useCallback(
    async (forceRefresh = false) => {
      if (!routineId) {
        setError(t("routineAnalysis.errors.noRoutineId"));
        setLoading(false);
        return;
      }

      // Check if analysis is already cached
      const cachedAnalysis = getAnalysis(routineId);
      if (cachedAnalysis && !forceRefresh) {
        setAnalysis(cachedAnalysis);
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

        // Aggregate exercise performance with round details
        const exerciseMap = new Map<ExerciseId, ExercisePerformance>();

        routine.stepResults.forEach((step) => {
          const existing = exerciseMap.get(step.exerciseId);
          const timePerRep = step.reps > 0 ? step.durationMs / step.reps : 0;

          if (existing) {
            existing.actualReps += step.reps;
            existing.durationMs += step.durationMs;
            existing.rounds += 1;
            existing.roundDetails.push({
              roundNumber: existing.rounds,
              reps: step.reps,
              durationMs: step.durationMs,
              timePerRep,
            });
          } else {
            exerciseMap.set(step.exerciseId, {
              exerciseId: step.exerciseId,
              targetReps: step.targetReps,
              actualReps: step.reps,
              durationMs: step.durationMs,
              rounds: 1,
              roundDetails: [
                {
                  roundNumber: 1,
                  reps: step.reps,
                  durationMs: step.durationMs,
                  timePerRep,
                },
              ],
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
        saveAnalysis(routineId, result);
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
    },
    [routineId, getAnalysis, history, t, i18n.language, saveAnalysis],
  );

  const handleReanalyze = useCallback(() => {
    performAnalysis(true);
  }, [performAnalysis]);

  useEffect(() => {
    performAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routineId]);

  return {
    loading,
    error,
    analysis,
    getScoreColor,
    handleReanalyze,
    performAnalysis,
  };
};
