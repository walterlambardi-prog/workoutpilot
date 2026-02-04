import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import type { PersistOptions } from "zustand/middleware";

import type { LatLng } from "@/components/MapView/MapView.types";
import { createCrossPlatformStorage } from "@/utils/storage";
import { syncService } from "@/utils/syncService";

// Use require to avoid import.meta issues on web builds
const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

const HISTORY_LIMIT = 75;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface StepTrackerSessionEntry {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  steps: number;
  distanceKm: number;
  positions: LatLng[];
}

export interface ActiveSession {
  id: string;
  startedAt: number;
  steps: number;
  distanceKm: number;
  positions: LatLng[];
}

interface StepTrackerState {
  history: StepTrackerSessionEntry[];
  activeSession: ActiveSession | null;
  addSession: (
    session: Omit<StepTrackerSessionEntry, "id"> & { id?: string },
  ) => void;
  startActiveSession: () => void;
  updateActiveSession: (
    update: Partial<Omit<ActiveSession, "id" | "startedAt">>,
  ) => void;
  addPositionToActiveSession: (position: LatLng) => void;
  finalizeActiveSession: () => void;
  clearActiveSession: () => void;
  resetHistory: () => void;
  loadHistoryFromSupabase: () => Promise<void>;
  deleteCloudHistory: () => Promise<void>;
}

type PersistedState = StepTrackerState;

const storage = createCrossPlatformStorage();

const createTyped = createFn as <T>(
  initializer: StateCreator<T, [], [], T>,
) => UseBoundStore<StoreApi<T>>;

export const useStepTrackerStore = createTyped<StepTrackerState>(
  (
    persist as <T>(
      config: StateCreator<T, [], [], T>,
      options: PersistOptions<T, Partial<T>>,
    ) => StateCreator<T, [], [], T>
  )(
    (set) => ({
      history: [],
      activeSession: null,
      addSession: (session) => {
        const entry: StepTrackerSessionEntry = {
          ...session,
          id: session.id ?? createId(),
          positions: session.positions.slice(-750),
        };

        set((state: StepTrackerState) => ({
          history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
        }));
      },
      startActiveSession: () => {
        set({
          activeSession: {
            id: createId(),
            startedAt: Date.now(),
            steps: 0,
            distanceKm: 0,
            positions: [],
          },
        });
      },
      updateActiveSession: (update) => {
        set((state: StepTrackerState) => {
          if (!state.activeSession) {
            console.log(
              "[StepTrackerStore] ❌ Cannot update - no active session",
            );
            return state;
          }

          console.log("[StepTrackerStore] ✅ Updating session:", update);
          console.log("[StepTrackerStore] Before:", {
            steps: state.activeSession.steps,
            distanceKm: state.activeSession.distanceKm,
          });

          const updated = {
            activeSession: {
              ...state.activeSession,
              ...update,
            },
          };

          console.log("[StepTrackerStore] After:", {
            steps: updated.activeSession.steps,
            distanceKm: updated.activeSession.distanceKm,
          });

          return updated;
        });
      },
      addPositionToActiveSession: (position) => {
        set((state: StepTrackerState) => {
          if (!state.activeSession) {
            console.log(
              "[StepTrackerStore] No active session, cannot add position",
            );
            return state;
          }

          const positions = [...state.activeSession.positions];
          const last = positions[positions.length - 1];

          // Avoid duplicates
          if (
            last &&
            last.latitude === position.latitude &&
            last.longitude === position.longitude
          ) {
            console.log(
              "[StepTrackerStore] Duplicate position detected, skipping",
            );
            return state;
          }

          positions.push(position);
          console.log(
            `[StepTrackerStore] Added position, total positions: ${positions.length}`,
          );

          return {
            activeSession: {
              ...state.activeSession,
              positions: positions.slice(-750), // Keep last 750 positions
            },
          };
        });
      },
      finalizeActiveSession: () => {
        set((state: StepTrackerState) => {
          if (!state.activeSession) return state;

          const endedAt = Date.now();
          const durationMs = endedAt - state.activeSession.startedAt;

          const entry: StepTrackerSessionEntry = {
            id: state.activeSession.id,
            startedAt: state.activeSession.startedAt,
            endedAt,
            durationMs,
            steps: state.activeSession.steps,
            distanceKm: state.activeSession.distanceKm,
            positions: state.activeSession.positions,
          };

          // ✅ Sync to Supabase (non-blocking)
          syncService.syncStepTrackerSession(entry).catch((error) => {
            console.error(
              "[StepTrackerStore] Sync failed, queued for retry:",
              error,
            );
          });

          return {
            activeSession: null,
            history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
          };
        });
      },
      clearActiveSession: () => {
        set({ activeSession: null });
      },
      resetHistory: () => set({ history: [] }),
      loadHistoryFromSupabase: async () => {
        try {
          const { stepTrackerSessions } = await syncService.loadFullHistory();
          set({ history: stepTrackerSessions });
          console.log(
            "[StepTrackerStore] ✅ Loaded history from Supabase:",
            stepTrackerSessions.length,
          );
        } catch (error) {
          console.error(
            "[StepTrackerStore] Failed to load from Supabase:",
            error,
          );
          // Fallback: keep AsyncStorage data
        }
      },
      deleteCloudHistory: async () => {
        try {
          await syncService.deleteAllStepTrackerSessions();
          console.log("[StepTrackerStore] ✅ Deleted cloud history");
        } catch (error) {
          console.error(
            "[StepTrackerStore] Failed to delete cloud history:",
            error,
          );
          throw error;
        }
      },
    }),
    {
      name: "step-tracker-store",
      version: 1,
      storage,
      partialize: (state: PersistedState) => ({
        history: state.history,
        activeSession: state.activeSession,
      }),
      merge: (persisted, current) => ({
        ...current,
        ...(persisted as PersistedState),
      }),
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
    useStepTrackerStore.subscribe((state: StepTrackerState) => {
      reactotron?.display?.({
        name: "StepTrackerStore",
        value: state,
        preview: `history=${state.history.length}`,
      });
    });
  }
}
