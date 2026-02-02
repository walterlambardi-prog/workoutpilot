import type { StateCreator, StoreApi, UseBoundStore } from "zustand";
import type { PersistOptions } from "zustand/middleware";

import type { LatLng } from "@/components/MapView/MapView.types";
import { createCrossPlatformStorage } from "@/utils/storage";

// Use require to avoid import.meta issues on web builds
const { create: createFn } = require("zustand");
const { persist } = require("zustand/middleware");

const HISTORY_LIMIT = 75;

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export interface WalkingSessionEntry {
  id: string;
  startedAt: number;
  endedAt: number;
  durationMs: number;
  steps: number;
  distanceKm: number;
  positions: LatLng[];
}

interface WalkingSessionState {
  history: WalkingSessionEntry[];
  addSession: (
    session: Omit<WalkingSessionEntry, "id"> & { id?: string },
  ) => void;
  resetHistory: () => void;
}

type PersistedState = WalkingSessionState;

const storage = createCrossPlatformStorage();

const createTyped = createFn as <T>(
  initializer: StateCreator<T, [], [], T>,
) => UseBoundStore<StoreApi<T>>;

export const useWalkingSessionStore = createTyped<WalkingSessionState>(
  (
    persist as <T>(
      config: StateCreator<T, [], [], T>,
      options: PersistOptions<T, Partial<T>>,
    ) => StateCreator<T, [], [], T>
  )(
    (set) => ({
      history: [],
      addSession: (session) => {
        const entry: WalkingSessionEntry = {
          ...session,
          id: session.id ?? createId(),
          positions: session.positions.slice(-750),
        };

        set((state: WalkingSessionState) => ({
          history: [entry, ...state.history].slice(0, HISTORY_LIMIT),
        }));
      },
      resetHistory: () => set({ history: [] }),
    }),
    {
      name: "walking-session-store",
      version: 1,
      storage,
      partialize: (state: PersistedState) => ({ history: state.history }),
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
    useWalkingSessionStore.subscribe((state: WalkingSessionState) => {
      reactotron?.display?.({
        name: "WalkingSessionStore",
        value: state,
        preview: `history=${state.history.length}`,
      });
    });
  }
}
