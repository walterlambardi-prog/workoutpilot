import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ExerciseId } from "@/constants/exercises";
import {
  useRoutineBuilderStore,
  type RoutinePlanStepBase,
} from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import {
  AI_COACH_API_URL,
  AI_COACH_MODEL,
  ALLOWED_EXERCISES,
  HISTORY_WINDOW,
  LEVEL_REGEX,
  MAX_TOKENS,
  REP_MAX,
  REP_MIN,
  ROUND_MAX,
  ROUND_MIN,
  TEMPERATURE,
  TOPIC_KEYWORDS,
} from "./aiCoach.constants";
import type {
  ChatMessage,
  LevelPrompt,
  ParsedRoutinePlan,
  RoutinePlanItem,
  Suggestion,
} from "./aiCoach.types";

const normalizeText = (value?: string) => value?.trim() ?? "";

const EXERCISE_KEY_MAP: Record<string, ExerciseId> = {
  squats: ExerciseId.SQUATS,
  squat: ExerciseId.SQUATS,
  pushups: ExerciseId.PUSHUPS,
  pushup: ExerciseId.PUSHUPS,
  "push-ups": ExerciseId.PUSHUPS,
  "push-up": ExerciseId.PUSHUPS,
  hammercurls: ExerciseId.HAMMER_CURLS,
  hammercurl: ExerciseId.HAMMER_CURLS,
  "hammer-curls": ExerciseId.HAMMER_CURLS,
  "hammer-curl": ExerciseId.HAMMER_CURLS,
  lateralraises: ExerciseId.LATERAL_RAISES,
  "lateral-raises": ExerciseId.LATERAL_RAISES,
  lateralraise: ExerciseId.LATERAL_RAISES,
};

const toExerciseId = (value?: string): ExerciseId | null => {
  if (!value) return null;
  const lowered = value.toLowerCase();
  const withSplitSeparators = lowered
    .replace(/\band\b/g, ",")
    .replace(/\by\b/g, ",")
    .replace(/\s+\|\s+/g, ",")
    .replace(/\s+/g, " ");
  const parts = withSplitSeparators
    .split(/[,,/]/)
    .map((part) => part.trim())
    .filter(Boolean);

  for (const part of parts) {
    const normalized = part.replace(/[^a-z]/g, "");
    const match = EXERCISE_KEY_MAP[normalized];
    if (match) return match;
  }

  const fallback = lowered.replace(/[^a-z]/g, "");
  return EXERCISE_KEY_MAP[fallback] ?? null;
};

const clampRounds = (rounds: number | null | undefined) => {
  if (!Number.isFinite(rounds)) return ROUND_MIN;
  return Math.min(Math.max(Math.floor(rounds as number), ROUND_MIN), ROUND_MAX);
};

const clampReps = (reps: number | null | undefined) => {
  if (!Number.isFinite(reps)) return REP_MIN;
  return Math.min(Math.max(Math.floor(reps as number), REP_MIN), REP_MAX);
};

const buildConversationContext = (history: ChatMessage[], topicGuard: string) =>
  history
    .filter((msg) => normalizeText(msg.content) !== normalizeText(topicGuard))
    .slice(-HISTORY_WINDOW)
    .map(
      (msg) =>
        `${msg.role === "assistant" ? "Coach" : "Usuario"}: ${normalizeText(msg.content)}`,
    )
    .join("\n");

const hasLevelInfo = (history: ChatMessage[]) => {
  const text = history
    .map((msg) => normalizeText(msg.content).toLowerCase())
    .join(" ");
  return LEVEL_REGEX.test(text);
};

const buildSystemPrompt = (
  topicGuard: string,
  lang: string,
  conversationContext: string,
  exerciseList: string,
  hasLevel: boolean,
  levelPrompt: string,
  levelOptions: string[],
) => {
  const responseLanguage = lang?.startsWith("es") ? "espanol" : "english";
  const contextualHistory =
    conversationContext ||
    "Sin contexto previo; pide edad, frecuencia semanal y nivel antes de generar una rutina.";
  const levelJson = JSON.stringify({
    needsLevel: true,
    prompt: levelPrompt,
    options: levelOptions,
  });

  return `Eres un coach de entrenamiento. Responde SOLO en ${responseLanguage}.
Si el usuario solicita una rutina pero no tienes el nivel del usuario, responde únicamente con este JSON y nada más: ${levelJson}
Si el usuario solo saluda ("hola", "hello", "buenas"), respóndele con un saludo breve y una invitación a armar una rutina; sugiere que comparta nivel y objetivo. No uses ${topicGuard} en ese caso.
Si el usuario ya indicó su nivel en el mismo mensaje (ej. "principiante", "intermedio", "avanzado"), no pidas el nivel otra vez ni devuelvas el JSON de nivel pendiente; pide solo los datos faltantes (edad y frecuencia semanal) o entrega la rutina si ya los tienes.
Cuando tengas edad, frecuencia semanal y nivel, devuelve SOLO un JSON válido con esta forma exacta y SIN envolverlo en otro JSON (nada de id/model/choices):
{"rounds":entero_${ROUND_MIN}_a_${ROUND_MAX},"exercises":[{"key":"${exerciseList}","reps":entero_${REP_MIN}_a_${REP_MAX}}]}
- Usa entre 2 y 4 ejercicios.
- La clave "key" de cada ejercicio debe ser UNA sola de estas: ${exerciseList}. No combines con "|", "," o "y"; elige una sola.
- "reps" y "rounds" deben ser enteros dentro de los rangos indicados.
- No agregues texto antes o después del JSON ni metas el JSON dentro de otro objeto.
El JSON de nivel anterior SOLO se usa cuando realmente falta el nivel.
Si el usuario ya dijo su nivel (ej. principiante/intermedio/avanzado), está prohibido devolver un JSON con needsLevel; no preguntes el nivel otra vez.
Cuando el nivel ya está presente, pide únicamente los datos faltantes (edad y frecuencia semanal) y, si ya tienes esos datos, entrega la rutina en el formato indicado.
Si el usuario pide técnica o consejos, responde con 2-4 frases breves sin JSON.
Si el usuario habla de un tema fuera de ejercicio, responde exactamente "${topicGuard}".
Contexto de la conversación:
${contextualHistory}
Estado de nivel en la conversación: ${hasLevel ? "nivel presente" : "nivel faltante"}.`;
};

export const parseJsonPlan = (raw: string): ParsedRoutinePlan | null => {
  const parseRoutineObject = (maybe: unknown): ParsedRoutinePlan | null => {
    if (!maybe || typeof maybe !== "object") return null;
    const parsed = maybe as { rounds?: unknown; exercises?: unknown };
    if (!Array.isArray(parsed.exercises)) return null;

    type PlanDraft = { exerciseId: ExerciseId | null; targetReps: number };

    const planDraft = parsed.exercises
      .map(
        (item: {
          key?: string;
          reps?: number;
          exercise?: string;
          target?: number;
        }): PlanDraft => ({
          exerciseId: toExerciseId(item.key ?? item.exercise ?? ""),
          targetReps: clampReps(item.reps ?? item.target),
        }),
      )
      .filter(
        (
          item: PlanDraft,
        ): item is { exerciseId: ExerciseId; targetReps: number } =>
          item.exerciseId !== null,
      );

    const plan: RoutinePlanItem[] = planDraft.map(
      (item: { exerciseId: ExerciseId; targetReps: number }) => ({
        exerciseId: item.exerciseId,
        targetReps: item.targetReps,
      }),
    );

    const roundsValue = clampRounds(Number(parsed.rounds));

    return plan.length ? { plan, rounds: roundsValue } : null;
  };

  const parseFromString = (text: string): ParsedRoutinePlan | null => {
    try {
      const matcher = /\{[\s\S]*\}/.exec(text);
      if (!matcher) return null;
      const asObject = JSON.parse(matcher[0]);
      return parseRoutineObject(asObject);
    } catch {
      return null;
    }
  };

  const direct = parseFromString(raw);
  if (direct) return direct;

  try {
    const envelope = JSON.parse(raw);
    const content =
      envelope?.choices?.[0]?.message?.content ?? envelope?.message?.content;
    if (typeof content === "string") {
      const inner = parseFromString(content);
      if (inner) return inner;
    }
    const asRoutine = parseRoutineObject(envelope);
    if (asRoutine) return asRoutine;
  } catch {
    // ignore
  }

  return null;
};

export const parseLevelPrompt = (raw: string): LevelPrompt | null => {
  try {
    const matcher = /\{[\s\S]*\}/.exec(raw);
    if (!matcher) return null;
    const parsed = JSON.parse(matcher[0]);
    const needsLevel = Boolean(parsed?.needsLevel);
    if (!needsLevel) return null;
    const options: unknown = parsed?.options;
    const prompt = typeof parsed?.prompt === "string" ? parsed.prompt : "";
    if (!Array.isArray(options)) return null;
    const normalized = options.filter(
      (opt): opt is string => typeof opt === "string" && opt.trim().length > 0,
    );
    return normalized.length ? { prompt, options: normalized } : null;
  } catch {
    return null;
  }
};

export function useAiCoach() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [parsedPlan, setParsedPlan] = useState<RoutinePlanItem[] | null>(null);
  const [parsedRounds, setParsedRounds] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>(() => [
    {
      id: "assistant-welcome",
      role: "assistant",
      content: t("aiCoach.welcome"),
      createdAt: Date.now(),
    },
  ]);

  const startRoutineSession = useRoutineSessionStore(
    (state) => state.startSession,
  );
  const applyRoutinePlan = useRoutineBuilderStore((state) => state.applyPlan);

  const levelOptions = useMemo(
    () => [
      t("aiCoach.levelOptions.beginner"),
      t("aiCoach.levelOptions.intermediate"),
      t("aiCoach.levelOptions.advanced"),
    ],
    [t],
  );

  const suggestions: Suggestion[] = useMemo(
    () => [
      { id: "starter", text: t("aiCoach.suggestions.starter") },
      { id: "reps", text: t("aiCoach.suggestions.reps") },
      { id: "form", text: t("aiCoach.suggestions.form") },
    ],
    [t],
  );

  const isGreeting = useCallback((text: string) => {
    const normalized = text.toLowerCase().trim();
    return /^(hola|holaa|holi|hello|hi|hey|buenas|buenos dias|buenas tardes|buenas noches)\b/.test(
      normalized,
    );
  }, []);

  const isOnTopic = useCallback((text: string) => {
    const normalized = text.toLowerCase().trim();
    const isNumericResponse = /^\d{1,3}$/.test(normalized);
    const mentionsLevel = LEVEL_REGEX.test(normalized);
    return (
      isNumericResponse ||
      mentionsLevel ||
      TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword))
    );
  }, []);

  const handleStartRoutineFromPlan = useCallback(
    (planOverride?: RoutinePlanItem[], roundsOverride?: number | null) => {
      const effectivePlan = planOverride ?? parsedPlan;
      if (!effectivePlan || effectivePlan.length === 0) return;

      const rounds = clampRounds(roundsOverride ?? parsedRounds ?? ROUND_MIN);
      const sessionPlan = Array.from({ length: rounds })
        .fill(null)
        .flatMap((_, roundIndex) =>
          effectivePlan.map((item) => ({
            exerciseId: item.exerciseId,
            targetReps: clampReps(item.targetReps),
            round: roundIndex + 1,
          })),
        );

      const sessionId = startRoutineSession(sessionPlan, rounds);
      const firstStep = sessionPlan[0];
      if (!sessionId || !firstStep) return;
      router.push({
        pathname: "/exercises/[exerciseId]",
        params: {
          exerciseId: firstStep.exerciseId,
          routineId: sessionId,
          stepIndex: "0",
        },
      });
    },
    [parsedPlan, parsedRounds, router, startRoutineSession],
  );

  const handleEditRoutineFromPlan = useCallback(
    (planOverride?: RoutinePlanItem[], roundsOverride?: number | null) => {
      const effectivePlan = planOverride ?? parsedPlan;
      if (!effectivePlan || effectivePlan.length === 0) return;

      const rounds = clampRounds(roundsOverride ?? parsedRounds ?? ROUND_MIN);
      const builderPlan: RoutinePlanStepBase[] = effectivePlan.map((item) => ({
        exerciseId: item.exerciseId,
        targetReps: clampReps(item.targetReps),
      }));

      applyRoutinePlan(builderPlan, rounds);
      router.push("/routine");
    },
    [applyRoutinePlan, parsedPlan, parsedRounds, router],
  );

  const sendMessage = useCallback(
    async (override?: string, allowRetry = true, addToHistory = true) => {
      const query = normalizeText(override ?? input);
      if (!query || loading) return;
      setParsedPlan(null);
      setParsedRounds(null);

      let workingHistory: ChatMessage[] = messages;
      if (addToHistory) {
        const userMessage: ChatMessage = {
          id: `user-${Date.now()}`,
          role: "user",
          content: query,
          createdAt: Date.now(),
        };
        workingHistory = [...messages, userMessage];
        setMessages(workingHistory);
        setInput("");
      }

      if (!addToHistory && !isOnTopic(query)) {
        return;
      }

      const historyForContext: ChatMessage[] = addToHistory
        ? workingHistory
        : [
            ...messages,
            {
              id: `temp-${Date.now()}`,
              role: "user" as const,
              content: query,
              createdAt: Date.now(),
            },
          ];

      const levelDetected = hasLevelInfo(historyForContext);
      const levelDetectedInline = LEVEL_REGEX.test(query.toLowerCase());
      const levelPresent = levelDetected || levelDetectedInline;
      const hasPendingLevelPrompt = historyForContext.some(
        (msg) =>
          msg.role === "assistant" && Boolean(parseLevelPrompt(msg.content)),
      );

      if (addToHistory && isGreeting(query)) {
        const greetingMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: t("aiCoach.greetingInvite"),
          createdAt: Date.now(),
        };
        const nextMessages = [...historyForContext, greetingMessage];
        setMessages(nextMessages);

        if (!levelPresent && !hasPendingLevelPrompt) {
          const levelPromptMessage: ChatMessage = {
            id: `assistant-${Date.now() + 1}`,
            role: "assistant",
            content: JSON.stringify({
              needsLevel: true,
              prompt: t("aiCoach.levelPromptTitle"),
              options: levelOptions,
            }),
            createdAt: Date.now() + 1,
          };
          setMessages((prev) => [...prev, levelPromptMessage]);
        }
        return;
      }

      if (addToHistory && !isOnTopic(query)) {
        setMessages((prev) => [
          ...prev,
          {
            id: `guard-${Date.now()}`,
            role: "assistant",
            content: t("aiCoach.topicGuard"),
            createdAt: Date.now(),
          },
        ]);
        return;
      }

      if (!levelPresent && !hasPendingLevelPrompt) {
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: JSON.stringify({
            needsLevel: true,
            prompt: t("aiCoach.levelPromptTitle"),
            options: levelOptions,
          }),
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
        return;
      }

      setLoading(true);
      try {
        const conversationContext = buildConversationContext(
          historyForContext,
          t("aiCoach.topicGuard"),
        );
        const recentMessages = historyForContext
          .slice(-HISTORY_WINDOW)
          .map((msg) => ({
            role: msg.role,
            content: msg.content,
          }));
        const exerciseList = ALLOWED_EXERCISES.join("|");
        const payload = {
          model: AI_COACH_MODEL,
          messages: [
            {
              role: "system",
              content: buildSystemPrompt(
                t("aiCoach.topicGuard"),
                i18n.language,
                conversationContext,
                exerciseList,
                levelPresent,
                t("aiCoach.levelPromptTitle"),
                levelOptions,
              ),
            },
            ...recentMessages,
          ],
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
        };

        const response = await fetch(AI_COACH_API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        const content = normalizeText(data?.choices?.[0]?.message?.content);

        const levelPrompt = content ? parseLevelPrompt(content) : null;
        const assistantMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: content || t("aiCoach.fetchError"),
          createdAt: Date.now(),
        };
        if (addToHistory) {
          setMessages((prev) => [...prev, assistantMessage]);
        }

        const parsed = levelPresent && content ? parseJsonPlan(content) : null;
        if (parsed) {
          setParsedPlan(parsed.plan);
          setParsedRounds(parsed.rounds);
        } else if (levelPrompt) {
          // waiting for user to pick a level
        } else if (allowRetry && content) {
          setLoading(false);
          await sendMessage(t("aiCoach.retrySystemPrompt"), false, false);
          return;
        }
      } catch {
        setMessages((prev) => [
          ...prev,
          {
            id: `assistant-${Date.now()}`,
            role: "assistant",
            content: t("aiCoach.fetchError"),
            createdAt: Date.now(),
          },
        ]);
      } finally {
        setLoading(false);
      }
    },
    [
      i18n.language,
      input,
      isGreeting,
      isOnTopic,
      levelOptions,
      loading,
      messages,
      t,
    ],
  );

  const handleSuggestion = useCallback(
    (suggestion: string) => {
      void sendMessage(suggestion);
    },
    [sendMessage],
  );

  const createSuggestionHandler = useCallback(
    (text: string) => () => {
      void handleSuggestion(text);
    },
    [handleSuggestion],
  );

  const handleSend = useCallback(() => {
    void sendMessage();
  }, [sendMessage]);

  const handleLevelSelect = useCallback(
    (level: string) => {
      void sendMessage(level);
    },
    [sendMessage],
  );

  return {
    input,
    setInput,
    loading,
    messages,
    parsedPlan,
    parsedRounds,
    suggestions,
    handleSend,
    createSuggestionHandler,
    handleStartRoutineFromPlan,
    handleEditRoutineFromPlan,
    handleLevelSelect,
  } as const;
}
