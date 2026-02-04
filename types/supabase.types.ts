/**
 * Supabase Database Types
 *
 * Type definitions for database tables and response mappers
 * Maps Supabase rows to app store types
 */

import type { RoutineAnalysisResponse } from "@/app/routineAnalysis/routineAnalysis.types";
import type { ExerciseSessionEntry } from "@/stores/exerciseSessionStore";
import type { RoutineSession } from "@/stores/routineSessionStore";
import type { StepTrackerSessionEntry } from "@/stores/stepTrackerStore";

// ============================================================
// Database Row Types (matches Supabase schema)
// ============================================================

export interface ExerciseSessionRow {
  id: string;
  user_id: string;
  exercise_id: string;
  routine_id: string | null;
  target_reps: number | null;
  reps: number;
  started_at: number;
  ended_at: number;
  duration_ms: number;
  created_at: string;
  synced_at: string;
}

export interface RoutineSessionRow {
  id: string;
  user_id: string;
  rounds: number;
  started_at: number;
  completed_at: number | null;
  plan: any; // JSONB
  step_results: any; // JSONB
  total_reps: number;
  created_at: string;
  synced_at: string;
}

export interface StepTrackerSessionRow {
  id: string;
  user_id: string;
  started_at: number;
  ended_at: number;
  duration_ms: number;
  steps: number;
  distance_km: string; // Numeric stored as string
  positions: any; // JSONB
  created_at: string;
  synced_at: string;
}

export interface RoutineAnalysisRow {
  id: string;
  routine_id: string;
  user_id: string;
  overall_score: number;
  overall_feedback: string;
  strengths: string[];
  improvements: string[];
  exercise_breakdown: any; // JSONB
  next_steps: string[];
  analyzed_at: number;
  created_at: string;
}

// ============================================================
// Insert Types (for upsert operations)
// ============================================================

export interface ExerciseSessionInsert {
  id: string;
  user_id: string;
  exercise_id: string;
  routine_id: string | null;
  target_reps: number | null;
  reps: number;
  started_at: number;
  ended_at: number;
  duration_ms: number;
}

export interface RoutineSessionInsert {
  id: string;
  user_id: string;
  rounds: number;
  started_at: number;
  completed_at: number | null;
  plan: any;
  step_results: any;
  total_reps: number;
}

export interface StepTrackerSessionInsert {
  id: string;
  user_id: string;
  started_at: number;
  ended_at: number;
  duration_ms: number;
  steps: number;
  distance_km: number;
  positions: any;
}

export interface RoutineAnalysisInsert {
  routine_id: string;
  user_id: string;
  overall_score: number;
  overall_feedback: string;
  strengths: string[];
  improvements: string[];
  exercise_breakdown: any;
  next_steps: string[];
  analyzed_at: number;
}

// ============================================================
// Mappers: Database Rows → App Store Types
// ============================================================

export function mapToExerciseSession(
  row: ExerciseSessionRow,
): ExerciseSessionEntry {
  return {
    id: row.id,
    exerciseId: row.exercise_id as any, // ExerciseId enum
    routineId: row.routine_id,
    targetReps: row.target_reps,
    reps: row.reps,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMs: row.duration_ms,
  };
}

export function mapToRoutineSession(row: RoutineSessionRow): RoutineSession {
  return {
    id: row.id,
    rounds: row.rounds,
    startedAt: row.started_at,
    completedAt: row.completed_at ?? undefined,
    plan: row.plan,
    currentStepIndex: 0,
    currentStepReps: 0,
    stepStartedAt: row.started_at,
    stepResults: row.step_results,
    totalReps: row.total_reps,
  };
}

export function mapToStepTrackerSession(
  row: StepTrackerSessionRow,
): StepTrackerSessionEntry {
  return {
    id: row.id,
    startedAt: row.started_at,
    endedAt: row.ended_at,
    durationMs: row.duration_ms,
    steps: row.steps,
    distanceKm: parseFloat(row.distance_km),
    positions: row.positions,
  };
}

export function mapToRoutineAnalysis(
  row: RoutineAnalysisRow,
): RoutineAnalysisResponse {
  return {
    overallScore: row.overall_score,
    overallFeedback: row.overall_feedback,
    strengths: row.strengths,
    improvements: row.improvements,
    exercises: row.exercise_breakdown,
    nextSteps: row.next_steps,
  };
}

// ============================================================
// Mappers: App Store Types → Database Insert
// ============================================================

export function mapFromExerciseSession(
  session: ExerciseSessionEntry,
  userId: string,
): ExerciseSessionInsert {
  return {
    id: session.id,
    user_id: userId,
    exercise_id: session.exerciseId,
    routine_id: session.routineId ?? null,
    target_reps: session.targetReps ?? null,
    reps: session.reps,
    started_at: session.startedAt,
    ended_at: session.endedAt ?? session.startedAt,
    duration_ms: session.durationMs ?? 0,
  };
}

export function mapFromRoutineSession(
  session: RoutineSession,
  userId: string,
): RoutineSessionInsert {
  return {
    id: session.id,
    user_id: userId,
    rounds: session.rounds,
    started_at: session.startedAt,
    completed_at: session.completedAt ?? null,
    plan: session.plan,
    step_results: session.stepResults,
    total_reps: session.totalReps,
  };
}

export function mapFromStepTrackerSession(
  session: StepTrackerSessionEntry,
  userId: string,
): StepTrackerSessionInsert {
  return {
    id: session.id,
    user_id: userId,
    started_at: session.startedAt,
    ended_at: session.endedAt,
    duration_ms: session.durationMs,
    steps: session.steps,
    distance_km: session.distanceKm,
    positions: session.positions,
  };
}

export function mapFromRoutineAnalysis(
  routineId: string,
  analysis: RoutineAnalysisResponse,
  userId: string,
): RoutineAnalysisInsert {
  return {
    routine_id: routineId,
    user_id: userId,
    overall_score: analysis.overallScore,
    overall_feedback: analysis.overallFeedback,
    strengths: analysis.strengths,
    improvements: analysis.improvements,
    exercise_breakdown: analysis.exercises,
    next_steps: analysis.nextSteps,
    analyzed_at: Date.now(),
  };
}
