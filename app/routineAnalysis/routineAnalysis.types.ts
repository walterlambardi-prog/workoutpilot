import type { ExerciseId } from "@/constants/exercises";

export interface RoutineAnalysisScreenProps {
  routineId?: string;
}

export interface ExercisePerformance {
  exerciseId: ExerciseId;
  targetReps: number;
  actualReps: number;
  durationMs: number;
  rounds: number;
}

export interface RoutineAnalysisRequest {
  routineId: string;
  totalRounds: number;
  totalDurationMs: number;
  totalReps: number;
  startedAt: number;
  completedAt: number;
  exercises: ExercisePerformance[];
}

export interface ExerciseAnalysis {
  exerciseId: string;
  performanceScore: number; // 0-100
  feedback: string;
  suggestions: string[];
}

export interface RoutineAnalysisResponse {
  overallScore: number; // 0-100
  overallFeedback: string;
  strengths: string[];
  improvements: string[];
  exercises: ExerciseAnalysis[];
  nextSteps: string[];
}
