import type { LatLng } from "@/components/MapView/MapView.types";

export type WalkingStatusKey =
  | "idle"
  | "requesting"
  | "tracking"
  | "paused"
  | "error";

export interface WalkingStats {
  steps?: number | null;
  distanceKm: number;
  durationMs: number;
}

export interface WalkingScreenProps {
  autoStart?: boolean;
}

export interface GeoTrackingState {
  positions: LatLng[];
  status: WalkingStatusKey;
  errorMessage?: string;
}
