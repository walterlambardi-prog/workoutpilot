import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import type { PersistOptions } from "zustand/middleware";

import { ExerciseId } from "@/constants/exercises";
// Use require to force CJS entry (avoids import.meta in ESM build on web)
// while keeping types via the imports above.
 
const { create: createFn } = require("zustand");
 
const { createJSONStorage, persist } = require("zustand/middleware");

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

const hasLocalStorage = typeof window !== "undefined" && !!window.localStorage;

const getAsyncStorage = async () => {
  const mod = await import("@react-native-async-storage/async-storage");
  return mod.default;
};

const storage = createJSONStorage(() => ({
  getItem: async (name: string) => {
    if (hasLocalStorage) {
      return window.localStorage.getItem(name);
    }
    const asyncStorage = await getAsyncStorage();
    return asyncStorage.getItem(name);
  },
  setItem: async (name: string, value: string) => {
    if (hasLocalStorage) {
      window.localStorage.setItem(name, value);
      return;
    }
    const asyncStorage = await getAsyncStorage();
    return asyncStorage.setItem(name, value);
  },
  removeItem: async (name: string) => {
    if (hasLocalStorage) {
      window.localStorage.removeItem(name);
      return;
    }
    const asyncStorage = await getAsyncStorage();
    return asyncStorage.removeItem(name);
  },
}));

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
