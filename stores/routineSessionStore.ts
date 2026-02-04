import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import type { PersistOptions } from "zustand/middleware";

import type { RoutineAnalysisResponse } from "@/app/routineAnalysis/routineAnalysis.types";
import { ExerciseId } from "@/constants/exercises";
import { createCrossPlatformStorage } from "@/utils/storage";
import { syncService } from "@/utils/syncService";

const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

const HISTORY_LIMIT = 12;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

type RoutinePlanStepBase = {
  exerciseId: ExerciseId;
  targetReps: number;
  round: number;
};

export interface RoutinePlanStep extends RoutinePlanStepBase {
  stepIndex: number;
}

export interface RoutineStepResult extends RoutinePlanStepBase {
  stepIndex: number;
  reps: number;
  startedAt: number;
  endedAt: number;
  durationMs: number;
}

export interface RoutineSession {
  id: string;
  rounds: number;
  startedAt: number;
  completedAt?: number;
  plan: RoutinePlanStep[];
  currentStepIndex: number;
  currentStepReps: number;
  stepStartedAt: number;
  stepResults: RoutineStepResult[];
  totalReps: number;
}

interface RoutineSessionState {
  activeSession: RoutineSession | null;
  lastCompletedSession: RoutineSession | null;
  history: RoutineSession[];
  analysisCache: Record<string, RoutineAnalysisResponse>;
  startSession: (plan: RoutinePlanStepBase[], rounds: number) => string;
  recordProgress: (reps: number) => void;
  completeCurrentStep: (params?: { repsOverride?: number }) => {
    nextStep: RoutinePlanStep | null;
    completedSession: RoutineSession | null;
    nextStepIndex: number | null;
  };
  jumpToStep: (stepIndex: number) => void;
  restartFromSession: (sessionId: string) => string | null;
  saveAnalysis: (routineId: string, analysis: RoutineAnalysisResponse) => void;
  getAnalysis: (routineId: string) => RoutineAnalysisResponse | null;
  resetActive: () => void;
  resetHistory: () => void;
  loadHistoryFromSupabase: () => Promise<void>;
  deleteCloudHistory: () => Promise<void>;
}

type PersistedState = RoutineSessionState;

const storage = createCrossPlatformStorage();

const createTyped = createFn as <T>(
  initializer: StateCreator<T, [], [], T>,
) => UseBoundStore<StoreApi<T>>;

const mapPlanWithIndex = (plan: RoutinePlanStepBase[]): RoutinePlanStep[] =>
  plan.map((step, index) => ({ ...step, stepIndex: index }));

const upsertResult = (
  results: RoutineStepResult[],
  next: RoutineStepResult,
): RoutineStepResult[] => {
  const existingIndex = results.findIndex(
    (item) => item.stepIndex === next.stepIndex,
  );

  if (existingIndex === -1) {
    return [...results, next];
  }

  const copy = [...results];
  copy[existingIndex] = next;
  return copy;
};

export const useRoutineSessionStore = createTyped<RoutineSessionState>(
  (
    persist as <T>(
      config: StateCreator<T, [], [], T>,
      options: PersistOptions<T, Partial<T>>,
    ) => StateCreator<T, [], [], T>
  )(
    (set, get) => ({
      activeSession: null,
      lastCompletedSession: null,
      history: [],
      analysisCache: {},
      startSession: (plan, rounds) => {
        const normalizedPlan = mapPlanWithIndex(plan);
        if (normalizedPlan.length === 0) {
          return "";
        }

        const session: RoutineSession = {
          id: createId(),
          rounds,
          plan: normalizedPlan,
          startedAt: Date.now(),
          stepStartedAt: Date.now(),
          currentStepIndex: 0,
          currentStepReps: 0,
          stepResults: [],
          totalReps: 0,
        };

        set({ activeSession: session });
        return session.id;
      },
      recordProgress: (reps) => {
        set((state) => {
          const session = state.activeSession;
          if (!session) return state;

          const nextReps = Math.max(0, Math.floor(reps));
          const delta = Math.max(0, nextReps - session.currentStepReps);

          if (delta === 0) {
            return state;
          }

          return {
            ...state,
            activeSession: {
              ...session,
              currentStepReps: nextReps,
              totalReps: session.totalReps + delta,
            },
          } as RoutineSessionState;
        });
      },
      completeCurrentStep: (params) => {
        const session = get().activeSession;
        if (!session) {
          return {
            nextStep: null,
            completedSession: null,
            nextStepIndex: null,
          };
        }

        const planStep = session.plan[session.currentStepIndex];
        if (!planStep) {
          return {
            nextStep: null,
            completedSession: null,
            nextStepIndex: null,
          };
        }

        const now = Date.now();
        const requestedReps = Math.max(
          0,
          Math.floor(params?.repsOverride ?? session.currentStepReps),
        );
        const progressDelta = Math.max(
          0,
          requestedReps - session.currentStepReps,
        );
        const reps = requestedReps;
        const result: RoutineStepResult = {
          ...planStep,
          reps,
          startedAt: session.stepStartedAt,
          endedAt: now,
          durationMs: Math.max(0, now - session.stepStartedAt),
        };

        const stepResults = upsertResult(session.stepResults, result);
        const nextStepIndex = session.currentStepIndex + 1;
        const hasNext = nextStepIndex < session.plan.length;

        if (hasNext) {
          const updated: RoutineSession = {
            ...session,
            stepResults,
            currentStepIndex: nextStepIndex,
            currentStepReps: 0,
            stepStartedAt: now,
            totalReps: session.totalReps + progressDelta,
          };
          set({ activeSession: updated } as RoutineSessionState);

          return {
            nextStep: updated.plan[nextStepIndex],
            completedSession: null,
            nextStepIndex,
          };
        }

        const completedSession: RoutineSession = {
          ...session,
          stepResults,
          currentStepReps: reps,
          completedAt: now,
          totalReps: session.totalReps + progressDelta,
        };

        // ✅ Sync to Supabase (non-blocking)
        syncService.syncRoutineSession(completedSession).catch((error) => {
          console.error(
            "[RoutineSessionStore] Sync failed, queued for retry:",
            error,
          );
        });

        set((state) => ({
          activeSession: null,
          lastCompletedSession: completedSession,
          history: [completedSession, ...state.history].slice(0, HISTORY_LIMIT),
        }));

        return {
          nextStep: null,
          completedSession,
          nextStepIndex: null,
        };
      },
      jumpToStep: (stepIndex) => {
        set((state) => {
          const session = state.activeSession;
          if (!session) return state;

          const clamped = Math.min(
            Math.max(0, Math.floor(stepIndex)),
            session.plan.length - 1,
          );

          if (clamped === session.currentStepIndex) return state;

          return {
            ...state,
            activeSession: {
              ...session,
              currentStepIndex: clamped,
              currentStepReps: 0,
              stepStartedAt: Date.now(),
            },
          } as RoutineSessionState;
        });
      },
      restartFromSession: (sessionId) => {
        const { history, lastCompletedSession, startSession } = get();
        const source =
          history.find((entry) => entry.id === sessionId) ??
          lastCompletedSession;

        if (!source) {
          return null;
        }

        return startSession(
          source.plan.map((step) => ({
            exerciseId: step.exerciseId,
            round: step.round,
            targetReps: step.targetReps,
          })),
          source.rounds,
        );
      },
      saveAnalysis: (routineId, analysis) => {
        // ✅ Sync to Supabase (non-blocking)
        syncService.syncRoutineAnalysis(routineId, analysis).catch((error) => {
          console.error("[RoutineSessionStore] Analysis sync failed:", error);
        });

        set((state) => ({
          ...state,
          analysisCache: {
            ...state.analysisCache,
            [routineId]: analysis,
          },
        }));
      },
      getAnalysis: (routineId) => {
        const { analysisCache } = get();
        return analysisCache[routineId] ?? null;
      },
      resetActive: () => set((state) => ({ ...state, activeSession: null })),
      resetHistory: () =>
        set({
          activeSession: null,
          lastCompletedSession: null,
          history: [],
          analysisCache: {},
        }),
      loadHistoryFromSupabase: async () => {
        try {
          const { routineSessions } = await syncService.loadFullHistory();
          set({ history: routineSessions });
          console.log(
            "[RoutineSessionStore] ✅ Loaded history from Supabase:",
            routineSessions.length,
          );
        } catch (error) {
          console.error(
            "[RoutineSessionStore] Failed to load from Supabase:",
            error,
          );
          // Fallback: keep AsyncStorage data
        }
      },
      deleteCloudHistory: async () => {
        try {
          await syncService.deleteAllRoutineSessions();
          console.log("[RoutineSessionStore] ✅ Deleted cloud history");
        } catch (error) {
          console.error(
            "[RoutineSessionStore] Failed to delete cloud history:",
            error,
          );
          throw error;
        }
      },
    }),
    {
      name: "routine-session-store",
      version: 1,
      storage,
      partialize: (state: PersistedState) => ({
        history: state.history,
        lastCompletedSession: state.lastCompletedSession,
        activeSession: state.activeSession,
        analysisCache: state.analysisCache,
      }),
      merge: (persisted, current) => {
        const data = persisted as PersistedState;
        return { ...current, ...data } as RoutineSessionState;
      },
    },
  ),
);

if (
  __DEV__ &&
  typeof navigator !== "undefined" &&
  navigator.product === "ReactNative"
) {
  const reactotron = require("@/config/reactotron").default;
  if (reactotron) {
    useRoutineSessionStore.subscribe((state: RoutineSessionState) => {
      const active = state.activeSession;
      reactotron?.display?.({
        name: "RoutineSessionStore",
        value: state,
        preview: active
          ? `session=${active.id} step=${active.currentStepIndex + 1}/${active.plan.length}`
          : `history=${state.history.length}`,
      });
    });
  }
}
