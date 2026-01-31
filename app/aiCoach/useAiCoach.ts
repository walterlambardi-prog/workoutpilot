import { EXERCISE_DEFINITIONS } from "@/app/exercises/exercises.data";
import { useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { ALLOWED_EXERCISES, ExerciseId } from "@/constants/exercises";
import {
    useRoutineBuilderStore,
    type RoutinePlanStepBase,
} from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import {
    AFFIRMATIVE_REGEX,
    AGE_REGEX,
    AI_COACH_API_URL,
    AI_COACH_MODEL,
    FREQUENCY_REGEX,
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
    ProfilePrompt,
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
  lunges: ExerciseId.LUNGES,
  lunge: ExerciseId.LUNGES,
  zancadas: ExerciseId.LUNGES,
  zancada: ExerciseId.LUNGES,
  estocadas: ExerciseId.LUNGES,
  estocada: ExerciseId.LUNGES,
  calfraises: ExerciseId.CALF_RAISES,
  calfraise: ExerciseId.CALF_RAISES,
  "calf-raises": ExerciseId.CALF_RAISES,
  "calf-raise": ExerciseId.CALF_RAISES,
  calfraising: ExerciseId.CALF_RAISES,
  pantorrillas: ExerciseId.CALF_RAISES,
  pantorrilla: ExerciseId.CALF_RAISES,
  gemelos: ExerciseId.CALF_RAISES,
  gemelo: ExerciseId.CALF_RAISES,
  standinglegraises: ExerciseId.STANDING_LEG_RAISES,
  standinglegraise: ExerciseId.STANDING_LEG_RAISES,
  "standing-leg-raises": ExerciseId.STANDING_LEG_RAISES,
  "standing-leg-raise": ExerciseId.STANDING_LEG_RAISES,
  legraises: ExerciseId.STANDING_LEG_RAISES,
  legraise: ExerciseId.STANDING_LEG_RAISES,
  "leg-raises": ExerciseId.STANDING_LEG_RAISES,
  sidelegraise: ExerciseId.STANDING_LEG_RAISES,
  sidelegraises: ExerciseId.STANDING_LEG_RAISES,
  laterallegraises: ExerciseId.STANDING_LEG_RAISES,
  laterallegraise: ExerciseId.STANDING_LEG_RAISES,
  hipabduction: ExerciseId.STANDING_LEG_RAISES,
  elevacionesdepierna: ExerciseId.STANDING_LEG_RAISES,
  elevacionpierna: ExerciseId.STANDING_LEG_RAISES,
  elevacioneslateralespierna: ExerciseId.STANDING_LEG_RAISES,
  elevacionlateralpierna: ExerciseId.STANDING_LEG_RAISES,
  "elevaciones-laterales-pierna": ExerciseId.STANDING_LEG_RAISES,
  "elevaciones-de-pierna": ExerciseId.STANDING_LEG_RAISES,
  abduccionescadera: ExerciseId.STANDING_LEG_RAISES,
  abduccioncadera: ExerciseId.STANDING_LEG_RAISES,
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

const userOnlyText = (history: ChatMessage[]) =>
  history
    .filter((msg) => msg.role === "user")
    .map((msg) => normalizeText(msg.content).toLowerCase())
    .join(" ");

const hasLevelInfo = (history: ChatMessage[]) => {
  const text = userOnlyText(history);
  return LEVEL_REGEX.test(text);
};

const hasAgeInfo = (history: ChatMessage[]) => {
  const text = userOnlyText(history);
  return AGE_REGEX.test(text);
};

const hasFrequencyInfo = (history: ChatMessage[]) => {
  const text = userOnlyText(history);
  return FREQUENCY_REGEX.test(text);
};

const buildSystemPrompt = (
  topicGuard: string,
  lang: string,
  conversationContext: string,
  hasLevel: boolean,
  levelPrompt: string,
  levelOptions: string[],
  hasAge: boolean,
  hasFrequency: boolean,
  profilePrompt: string,
  agePrompt: string,
  frequencyPrompt: string,
  ageLabel: string,
  frequencyLabel: string,
  submitLabel: string,
  allowedExerciseDefinitions: { id: string; copyKey: string }[],
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

  const profileJson = JSON.stringify({
    needsProfile: true,
    prompt:
      !hasAge && !hasFrequency
        ? profilePrompt
        : !hasAge
          ? agePrompt
          : frequencyPrompt,
    ageLabel,
    frequencyLabel,
    submitLabel,
    needAge: !hasAge,
    needFrequency: !hasFrequency,
  });

  // Build allowed exercise keys and descriptions from allowedExerciseDefinitions
  const allowedKeys = allowedExerciseDefinitions.map((ex) => ex.id).join(", ");
  const allowedDescriptions = allowedExerciseDefinitions
    .map((ex) => ex.id + ": " + ex.copyKey)
    .join("\n");

  console.log("allowedExerciseDefinitions", allowedExerciseDefinitions);
  console.log("allowedKeys", allowedKeys);

  return `Eres un coach de entrenamiento. Responde SOLO en ${responseLanguage}.
Checklist de respuesta (en orden):
1) Si falta el NIVEL -> responde SOLO ${levelJson}. No pidas edad/frecuencia ni generes rutina.
2) Si tienes NIVEL pero falta EDAD o FRECUENCIA -> responde SOLO ${profileJson}. No generes rutina.
3) Solo si tienes NIVEL + EDAD + FRECUENCIA -> entrega la rutina en JSON (sin texto extra).
Regla crítica: está prohibido generar rutina o incluir reps/rounds/exercises si falta NIVEL, EDAD o FRECUENCIA. No hay excepciones, aunque el usuario insista o pida rapidez.
Si falta el nivel, responde SIEMPRE solo con ${levelJson} y nada más. No preguntes edad ni frecuencia mientras falte el nivel.
Si ya tienes el nivel pero falta edad o frecuencia (una o ambas), responde únicamente con este JSON y nada más: ${profileJson}. No hagas preguntas abiertas.
Si ya tienes nivel + edad + frecuencia en la conversación, está prohibido pedirlos de nuevo; responde con la rutina directamente.
Si el usuario pide consejos o técnica (consejo, consejos, tip, tips, ayuda, mejorar, técnica, tecnica, form), responde con 2-4 frases concretas; NO pidas nivel/edad/frecuencia, NO uses JSON y NO devuelvas ${topicGuard}.
Si el usuario solo saluda ("hola", "hello", "buenas"), respóndele con un saludo breve y una invitación a armar una rutina; sugiere que comparta nivel y objetivo. No uses ${topicGuard} en ese caso.
Si el usuario ya indicó su nivel en el mismo mensaje (ej. "principiante", "intermedio", "avanzado"), no pidas el nivel otra vez ni devuelvas el JSON de nivel pendiente; pide solo los datos faltantes (edad y frecuencia semanal) o entrega la rutina si ya los tienes.
Cuando tengas edad, frecuencia semanal y nivel, devuelve SOLO un JSON válido con esta forma exacta y SIN envolverlo en otro JSON (nada de id/model/choices):
{"rounds":NUMERO_ENTERO,"exercises":[{"key":"NOMBRE_EJERCICIO","reps":NUMERO_ENTERO}]}
- Usa entre 1 y 6 ejercicios según el nivel del usuario y sus objetivos. Si el usuario pide específicamente UN solo ejercicio, respeta su solicitud y genera una rutina con ese único ejercicio. Principiantes: 2-3 ejercicios (o 1 si lo solicita). Intermedios: 3-4 ejercicios (o 1 si lo solicita). Avanzados: 4-6 ejercicios (o 1 si lo solicita).
- La clave "key" de cada ejercicio debe ser EXACTAMENTE una de estas opciones (copia tal cual): ${allowedKeys}
- Puedes usar todos los ejercicios disponibles si la rutina lo requiere. Si el usuario pide solo un ejercicio específico, usa únicamente ese ejercicio.
- "reps" debe ser un entero entre ${REP_MIN} y ${REP_MAX}.
- "rounds" debe ser un entero entre ${ROUND_MIN} y ${ROUND_MAX}.
- No agregues texto antes o después del JSON ni metas el JSON dentro de otro objeto.
Ejemplo de respuesta válida: {"rounds":3,"exercises":[{"key":"${allowedExerciseDefinitions[0]?.id}","reps":12}, {"key":"${allowedExerciseDefinitions[1]?.id}","reps":8}, {"key":"${allowedExerciseDefinitions[2]?.id}","reps":8}]}
Ejercicios disponibles:\n${allowedDescriptions}
El JSON de nivel anterior SOLO se usa cuando realmente falta el nivel.
El JSON de perfil (edad/frecuencia) se usa cuando falte alguno de esos datos; si ya tienes edad y frecuencia, no lo envíes.
Si el usuario ya dijo su nivel (ej. principiante/intermedio/avanzado), está prohibido devolver un JSON con needsLevel; no preguntes el nivel otra vez.
Si el nivel NO está presente, está prohibido entregar rutina o pedir edad/frecuencia; primero entrega solo el JSON de nivel. NUNCA generes una rutina si falta el nivel, aunque el usuario pida rapidez o tiempo. Si falta nivel, edad o frecuencia, no incluyas reps, rounds ni exercises en la respuesta.
Si ya tienes nivel + edad + frecuencia, entrega la rutina sin repetir preguntas. No solicites nuevamente esos datos aunque el usuario repita la intención.
Cuando el nivel ya está presente, pide únicamente los datos faltantes (edad y frecuencia semanal) y, si ya tienes esos datos, entrega la rutina en el formato indicado.
 Si el usuario pide técnica o consejos, responde con 2-4 frases breves sin JSON. No uses ${topicGuard} en ese caso.
 Si el usuario habla de un tema fuera de ejercicio, responde exactamente "${topicGuard}".
Contexto de la conversación:
${contextualHistory}
Estado de nivel en la conversación: ${hasLevel ? "nivel presente" : "nivel faltante"}.
Estado de edad: ${hasAge ? "edad presente" : "edad faltante"}.
Estado de frecuencia: ${hasFrequency ? "frecuencia presente" : "frecuencia faltante"}.
Recuerda: sin los tres datos (nivel, edad, frecuencia), no puedes responder con una rutina.`;
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

export const parseProfilePrompt = (raw: string): ProfilePrompt | null => {
  try {
    const matcher = /\{[\s\S]*\}/.exec(raw);
    if (!matcher) return null;
    const parsed = JSON.parse(matcher[0]);
    const needsProfile = Boolean(parsed?.needsProfile);
    if (!needsProfile) return null;

    const prompt =
      typeof parsed?.prompt === "string" ? parsed.prompt.trim() : "";
    const ageLabel =
      typeof parsed?.ageLabel === "string" ? parsed.ageLabel.trim() : "";
    const frequencyLabel =
      typeof parsed?.frequencyLabel === "string"
        ? parsed.frequencyLabel.trim()
        : "";
    const submitLabel =
      typeof parsed?.submitLabel === "string" ? parsed.submitLabel.trim() : "";

    const needAge = parsed?.needAge !== false;
    const needFrequency = parsed?.needFrequency !== false;

    return {
      prompt,
      ageLabel,
      frequencyLabel,
      submitLabel,
      needAge,
      needFrequency,
    };
  } catch {
    return null;
  }
};

export function useAiCoach() {
  // Only allowed exercises for use in the hook
  const allowedExerciseDefinitions = useMemo(
    () =>
      EXERCISE_DEFINITIONS.filter((ex) => ALLOWED_EXERCISES.includes(ex.id)),
    [],
  );
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

  const isAffirmation = useCallback((text: string) => {
    const normalized = text.toLowerCase().trim();
    return AFFIRMATIVE_REGEX.test(normalized);
  }, []);

  const isOnTopic = useCallback(
    (text: string) => {
      const normalized = text.toLowerCase().trim();
      const isNumericResponse = /^\d{1,3}$/.test(normalized);
      const mentionsLevel = LEVEL_REGEX.test(normalized);
      const mentionsAge = AGE_REGEX.test(normalized);
      const mentionsFrequency = FREQUENCY_REGEX.test(normalized);
      const mentionsAdvice =
        /consejo|consejos|tip|tips|ayuda|mejorar|form|técnica|tecnica/.test(
          normalized,
        );
      return (
        isNumericResponse ||
        mentionsLevel ||
        mentionsAge ||
        mentionsFrequency ||
        mentionsAdvice ||
        isAffirmation(text) ||
        TOPIC_KEYWORDS.some((keyword) => normalized.includes(keyword))
      );
    },
    [isAffirmation],
  );

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

      if (__DEV__) {
        const historyLog = historyForContext
          .slice(-HISTORY_WINDOW)
          .map((msg) => `${msg.role}: ${msg.content}`);
        console.log("[AI Coach][debug] history", historyLog);
      }

      const levelDetected = hasLevelInfo(historyForContext);
      const levelDetectedInline = LEVEL_REGEX.test(query.toLowerCase());
      const levelPresent = levelDetected || levelDetectedInline;
      const hasPendingLevelPrompt = historyForContext.some(
        (msg) =>
          msg.role === "assistant" && Boolean(parseLevelPrompt(msg.content)),
      );

      const ageDetected = hasAgeInfo(historyForContext);
      const ageDetectedInline = AGE_REGEX.test(query.toLowerCase());
      const agePresent = ageDetected || ageDetectedInline;

      const frequencyDetected = hasFrequencyInfo(historyForContext);
      const frequencyDetectedInline = FREQUENCY_REGEX.test(query.toLowerCase());
      const frequencyPresent = frequencyDetected || frequencyDetectedInline;

      const missingAge = !agePresent;
      const missingFrequency = !frequencyPresent;

      const profilePromptPayload = JSON.stringify({
        needsProfile: true,
        prompt:
          missingAge && missingFrequency
            ? t("aiCoach.profilePromptTitle")
            : missingAge
              ? t("aiCoach.profileAgePrompt")
              : t("aiCoach.profileFrequencyPrompt"),
        ageLabel: t("aiCoach.profileAgeLabel"),
        frequencyLabel: t("aiCoach.profileFrequencyLabel"),
        submitLabel: t("aiCoach.profileSubmit"),
        needAge: missingAge,
        needFrequency: missingFrequency,
      });

      if (addToHistory && isAffirmation(query)) {
        if (!levelPresent && !hasPendingLevelPrompt) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: JSON.stringify({
                needsLevel: true,
                prompt: t("aiCoach.levelPromptTitle"),
                options: levelOptions,
              }),
              createdAt: Date.now(),
            },
          ]);
          return;
        }

        if (levelPresent && (!agePresent || !frequencyPresent)) {
          setMessages((prev) => [
            ...prev,
            {
              id: `assistant-${Date.now()}`,
              role: "assistant",
              content: profilePromptPayload,
              createdAt: Date.now(),
            },
          ]);
          return;
        }
      }

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

      // If the user is asking for tips/advice (not a routine), avoid forcing level/age/frequency.
      const isAdviceOnly =
        /consejo|consejos|tip|tips|ayuda|mejorar|form|técnica|tecnica/.test(
          query.toLowerCase(),
        );

      if (!isAdviceOnly && !levelPresent && !hasPendingLevelPrompt) {
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

      if (!isAdviceOnly && levelPresent && (!agePresent || !frequencyPresent)) {
        const profileMessage: ChatMessage = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: profilePromptPayload,
          createdAt: Date.now(),
        };
        setMessages((prev) => [...prev, profileMessage]);
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
        const payload = {
          model: AI_COACH_MODEL,
          messages: [
            {
              role: "system",
              content: buildSystemPrompt(
                t("aiCoach.topicGuard"),
                i18n.language,
                conversationContext,
                levelPresent,
                t("aiCoach.levelPromptTitle"),
                levelOptions,
                agePresent,
                frequencyPresent,
                t("aiCoach.profilePromptTitle"),
                t("aiCoach.profileAgePrompt"),
                t("aiCoach.profileFrequencyPrompt"),
                t("aiCoach.profileAgeLabel"),
                t("aiCoach.profileFrequencyLabel"),
                t("aiCoach.profileSubmit"),
                allowedExerciseDefinitions,
              ),
            },
            ...recentMessages,
          ],
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE,
        };

        if (__DEV__) {
          console.log("[AI Coach][debug] request", {
            levelPresent,
            agePresent,
            frequencyPresent,
            recentMessages,
            systemPrompt: payload.messages[0]?.content,
          });
        }

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

        if (__DEV__) {
          console.log("[AI Coach][debug] response", { content });
        }

        const levelPrompt = content ? parseLevelPrompt(content) : null;
        const profilePrompt = content ? parseProfilePrompt(content) : null;
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
        } else if (profilePrompt) {
          // waiting for user to confirm age/frequency
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
      allowedExerciseDefinitions,
      i18n.language,
      input,
      isAffirmation,
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

  const handleSuggestionClick = useCallback(
    (text: string) => {
      setInput(text);
    },
    [setInput],
  );

  const handleSend = useCallback(() => {
    void sendMessage();
  }, [sendMessage]);

  const handleProfileSubmit = useCallback(
    (age?: string, frequency?: string) => {
      const ageValue = normalizeText(age);
      const frequencyValue = normalizeText(frequency);
      if (!ageValue && !frequencyValue) return;

      const parts: string[] = [];
      if (ageValue) {
        parts.push(t("aiCoach.profileAgeValue", { age: ageValue }));
      }
      if (frequencyValue) {
        parts.push(
          t("aiCoach.profileFrequencyValue", { frequency: frequencyValue }),
        );
      }

      const message = parts.join(". ");
      void sendMessage(message || undefined);
    },
    [sendMessage, t],
  );

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
    handleSuggestionClick,
    handleStartRoutineFromPlan,
    handleEditRoutineFromPlan,
    handleLevelSelect,
    handleProfileSubmit,
  } as const;
}
