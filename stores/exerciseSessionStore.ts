import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import type { PersistOptions } from "zustand/middleware";

import { ExerciseId } from "@/constants/exercises";
import { createCrossPlatformStorage } from "@/utils/storage";

// Use require to force CJS entry (avoids import.meta in ESM build on web)
// while keeping types via the imports above.
const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

export interface ExerciseSessionEntry {
  id: string;
  exerciseId: ExerciseId;
  routineId?: string | null;
  targetReps?: number | null;
  reps: number;
  startedAt: number;
  endedAt?: number;
  durationMs?: number;
}

interface ExerciseSessionState {
  currentSession: ExerciseSessionEntry | null;
  history: ExerciseSessionEntry[];
  startSession: (params: {
    exerciseId: ExerciseId;
    routineId?: string | null;
    targetReps?: number | null;
  }) => void;
  addRep: (exerciseId: ExerciseId, delta?: number) => void;
  endSession: () => void;
  resetHistory: () => void;
}

const HISTORY_LIMIT = 200;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const storage = createCrossPlatformStorage();

type PersistedState = ExerciseSessionState;

const createTyped = createFn as <T>(
  initializer: StateCreator<T, [], [], T>,
) => UseBoundStore<StoreApi<T>>;

export const useExerciseSessionStore = createTyped<ExerciseSessionState>(
  (
    persist as <T>(
      config: StateCreator<T, [], [], T>,
      options: PersistOptions<T, Partial<T>>, // minimal needed typing
    ) => StateCreator<T, [], [], T>
  )(
    (set, get) => ({
      currentSession: null,
      history: [],
      startSession: ({ exerciseId, routineId = null, targetReps = null }) => {
        const now = Date.now();
        set((state: ExerciseSessionState) => {
          const finished = state.currentSession
            ? {
                ...state.currentSession,
                endedAt: now,
                durationMs: now - state.currentSession.startedAt,
              }
            : null;

          const nextHistory = finished
            ? [finished, ...state.history].slice(0, HISTORY_LIMIT)
            : state.history;

          return {
            currentSession: {
              id: createId(),
              exerciseId,
              routineId,
              targetReps,
              reps: 0,
              startedAt: now,
            },
            history: nextHistory,
          };
        });
      },
      addRep: (exerciseId, delta = 1) => {
        const ensureSession = get().startSession;
        const current = get().currentSession;
        if (!current || current.exerciseId !== exerciseId) {
          ensureSession({ exerciseId });
        }

        const now = Date.now();
        set((state: ExerciseSessionState) => {
          const session = state.currentSession;
          if (!session || session.exerciseId !== exerciseId) {
            return state;
          }
          const reps = Math.max(0, session.reps + delta);
          return {
            ...state,
            currentSession: { ...session, reps, endedAt: now },
          };
        });
      },
      endSession: () => {
        const now = Date.now();
        set((state: ExerciseSessionState) => {
          if (!state.currentSession) return state;
          const finished: ExerciseSessionEntry = {
            ...state.currentSession,
            endedAt: now,
            durationMs: now - state.currentSession.startedAt,
          };
          return {
            currentSession: null,
            history: [finished, ...state.history].slice(0, HISTORY_LIMIT),
          };
        });
      },
      resetHistory: () => set({ history: [], currentSession: null }),
    }),
    {
      name: "exercise-session-store",
      version: 1,
      storage,
      partialize: (state: PersistedState) => ({
        history: state.history,
        currentSession: state.currentSession,
      }),
      merge: (persisted: unknown, current: PersistedState) => {
        const data = persisted as PersistedState;
        return { ...current, ...data };
      },
    },
  ),
);

// Subscribe to store changes for Reactotron debugging (native only)
if (
  __DEV__ &&
  typeof navigator !== "undefined" &&
  navigator.product === "ReactNative"
) {
  const reactotron = require("@/config/reactotron").default;
  if (reactotron) {
    useExerciseSessionStore.subscribe((state: ExerciseSessionState) => {
      reactotron?.display?.({
        name: "ExerciseSessionStore",
        value: state,
        preview: `session=${state.currentSession?.exerciseId ?? "-"} reps=${state.currentSession?.reps ?? 0}`,
      });
    });
  }
}
