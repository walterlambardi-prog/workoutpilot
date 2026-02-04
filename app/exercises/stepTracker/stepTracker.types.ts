import type { LatLng } from "@/components/MapView/MapView.types";

export type StepTrackerStatusKey =
  | "idle"
  | "requesting"
  | "tracking"
  | "paused"
  | "error";

export interface StepTrackerStats {
  steps?: number | null;
  distanceKm: number;
  durationMs: number;
}

export interface StepTrackerScreenProps {
  autoStart?: boolean;
}

export interface GeoTrackingState {
  positions: LatLng[];
  status: StepTrackerStatusKey;
  errorMessage?: string;
}

export interface StepTrackerSessionEntry {
  startedAt: number;
  endedAt: number;
  durationMs: number;
  steps: number;
  distanceKm: number;
  positions: LatLng[];
}
