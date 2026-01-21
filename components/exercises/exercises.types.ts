import { ExerciseId } from "@/constants/exercises";

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

export interface RoutineContext {
  isActive: boolean;
  routineId: string | null;
  targetReps: number;
  currentRound: number;
  totalRounds: number;
  stepIndex: number;
  totalSteps: number;
  nextExerciseId?: ExerciseId;
  onProgress?: (reps: number) => void;
  onComplete?: (reps: number) => void;
}

export interface ExercisesProps {
  exerciseId?: ExerciseId;
  routineContext?: RoutineContext;
}
