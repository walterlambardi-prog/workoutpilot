import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import type { PersistOptions } from "zustand/middleware";

import { ExerciseId } from "@/constants/exercises";
import { createCrossPlatformStorage } from "@/utils/storage";

const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

export const ROUTINE_DEFAULT_ROUNDS = 2;
export const ROUTINE_DEFAULT_REPS = 10;

export interface RoutineExerciseSettings {
  reps: number;
  isSelected: boolean;
}

export type RoutineExerciseState = Record<ExerciseId, RoutineExerciseSettings>;

interface RoutineBuilderState {
  rounds: number;
  exercises: RoutineExerciseState;
  setRounds: (rounds: number) => void;
  incrementRounds: () => void;
  decrementRounds: () => void;
  incrementReps: (exerciseId: ExerciseId) => void;
  decrementReps: (exerciseId: ExerciseId) => void;
  toggleExercise: (exerciseId: ExerciseId) => void;
  resetRoutine: () => void;
}

const storage = createCrossPlatformStorage();

const createDefaultExerciseSettings = (): RoutineExerciseSettings => ({
  reps: ROUTINE_DEFAULT_REPS,
  isSelected: true,
});

const createDefaultExercisesState = (): RoutineExerciseState => {
  return (Object.values(ExerciseId) as ExerciseId[]).reduce(
    (acc, exerciseId) => {
      acc[exerciseId] = createDefaultExerciseSettings();
      return acc;
    },
    {} as RoutineExerciseState,
  );
};

const createDefaultState = (): Pick<
  RoutineBuilderState,
  "rounds" | "exercises"
> => ({
  rounds: ROUTINE_DEFAULT_ROUNDS,
  exercises: createDefaultExercisesState(),
});

const createTyped = createFn as <T>(
  initializer: StateCreator<T, [], [], T>,
) => UseBoundStore<StoreApi<T>>;

export const useRoutineBuilderStore = createTyped<RoutineBuilderState>(
  (
    persist as <T>(
      config: StateCreator<T, [], [], T>,
      options: PersistOptions<T, Partial<T>>,
    ) => StateCreator<T, [], [], T>
  )(
    (set, get) => ({
      ...createDefaultState(),
      setRounds: (rounds) =>
        set(() => ({ rounds: Math.max(1, Math.floor(rounds)) })),
      incrementRounds: () => set((state) => ({ rounds: state.rounds + 1 })),
      decrementRounds: () =>
        set((state) => ({ rounds: Math.max(1, state.rounds - 1) })),
      incrementReps: (exerciseId) =>
        set((state) => {
          const current =
            state.exercises[exerciseId] ?? createDefaultExerciseSettings();
          return {
            exercises: {
              ...state.exercises,
              [exerciseId]: { ...current, reps: current.reps + 1 },
            },
          };
        }),
      decrementReps: (exerciseId) =>
        set((state) => {
          const current =
            state.exercises[exerciseId] ?? createDefaultExerciseSettings();
          return {
            exercises: {
              ...state.exercises,
              [exerciseId]: {
                ...current,
                reps: Math.max(1, current.reps - 1),
              },
            },
          };
        }),
      toggleExercise: (exerciseId) =>
        set((state) => {
          const current =
            state.exercises[exerciseId] ?? createDefaultExerciseSettings();
          return {
            exercises: {
              ...state.exercises,
              [exerciseId]: { ...current, isSelected: !current.isSelected },
            },
          };
        }),
      resetRoutine: () => set(() => createDefaultState()),
    }),
    {
      name: "routine-builder-store",
      version: 1,
      storage,
      merge: (persistedState: unknown, currentState: RoutineBuilderState) => {
        const data = persistedState as Partial<RoutineBuilderState> | null;
        if (!data) {
          return currentState;
        }

        const exercises = {
          ...createDefaultExercisesState(),
          ...(data.exercises ?? {}),
        } as RoutineExerciseState;

        return {
          ...currentState,
          ...data,
          exercises,
        };
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
    useRoutineBuilderStore.subscribe((state: RoutineBuilderState) => {
      const selected = Object.values(state.exercises).filter(
        (config) => config.isSelected,
      ).length;

      reactotron?.display?.({
        name: "RoutineBuilderStore",
        value: state,
        preview: `rounds=${state.rounds} selected=${selected}`,
      });
    });
  }
}
