import { ExerciseId } from "@/constants/exercises";

export type ChatRole = "user" | "assistant";

export type ChatMessage = {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: number;
};

export type Suggestion = {
  readonly id: string;
  readonly text: string;
};

export type RoutinePlanItem = {
  readonly exerciseId: ExerciseId;
  readonly targetReps: number;
};

export type ParsedRoutinePlan = {
  readonly plan: RoutinePlanItem[];
  readonly rounds: number | null;
};

export type LevelPrompt = {
  readonly prompt: string;
  readonly options: string[];
};
