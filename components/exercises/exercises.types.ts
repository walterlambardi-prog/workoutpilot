export type Status =
  | "idle"
  | "loading"
  | "ready"
  | "running"
  | "detecting"
  | "error";

export type PoseMessageKey =
  | "cameraReady"
  | "poseDetected"
  | "noPoseDetected"
  | "processingError"
  | "cameraSwitched"
  | "cameraSwitchError"
  | "promptCameraAccess"
  | "modelNotReady"
  | "requestingWebcam"
  | "processing"
  | "webcamStartError"
  | "webcamStopped"
  | "modelLoading"
  | "modelLoaded"
  | "modelLoadError"
  | "liveLandmarks";

export interface PoseStats {
  poseCount?: number;
  repCount?: number;
  progress?: number;
  feedback?: string;
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
