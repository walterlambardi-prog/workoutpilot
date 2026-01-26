export interface SessionStatItem {
  label: string;
  value: string;
}

export interface SessionListItem {
  id: string;
  title: string;
  subtitle: string;
  repsLabel: string;
  durationLabel?: string;
  endedLabel?: string;
}

export interface RoutineListItem {
  id: string;
  rounds: number;
  totalReps: number;
  exerciseCount: number;
  durationMs: number;
  completedAt: number;
}
