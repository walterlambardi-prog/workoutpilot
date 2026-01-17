export type Status =
  | "idle"
  | "loading"
  | "ready"
  | "running"
  | "detecting"
  | "error";

export interface PoseStats {
  poseCount?: number;
}

export interface PoseLandmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface MediaPipeResult {
  landmarks?: PoseLandmark[][];
}
