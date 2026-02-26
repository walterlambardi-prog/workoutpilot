import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { Card, H2, Text, XStack, YStack, useTheme } from "tamagui";

import { TButton } from "@/components/TButton";
import { TPage } from "@/components/TPage";
import type { ExerciseId } from "@/constants/exercises";
import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

const CIRCLE_SIZE = 180;
const STROKE_WIDTH = 8;

const normalizeParam = (value?: string | string[]) =>
  Array.isArray(value) ? value[0] : value;

const RestScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const params = useLocalSearchParams();

  const routineId = normalizeParam(params.routineId) ?? "";
  const nextExerciseId = normalizeParam(params.nextExerciseId) ?? "";
  const nextStepIndex = normalizeParam(params.nextStepIndex) ?? "0";
  const restSecondsParam = Number(normalizeParam(params.restSeconds) ?? "30");
  const totalSeconds = Math.max(1, restSecondsParam);

  const [remaining, setRemaining] = useState(totalSeconds);
  const [isPaused, setIsPaused] = useState(false);
  const startTimeRef = useRef(Date.now());
  const navigatedRef = useRef(false);

  const addRestTime = useRoutineSessionStore((s) => s.addRestTime);
  const session = useRoutineSessionStore((s) => s.activeSession);

  // Colors
  const primaryColor = (theme.primary?.get() ?? theme.blue11?.get()) as string;
  const successColor = theme.success?.get() as string;

  // Formatted time
  const formattedTime = useMemo(() => {
    const mins = Math.floor(remaining / 60);
    const secs = remaining % 60;
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, "0")}`;
    return `${secs}`;
  }, [remaining]);

  // Next exercise name
  const nextExerciseName = useMemo(() => {
    const key = EXERCISE_COPY_KEYS[nextExerciseId as ExerciseId];
    return key ? t(`${key}.title`) : nextExerciseId;
  }, [nextExerciseId, t]);

  // Current step info from session
  const stepInfo = useMemo(() => {
    if (!session) return null;
    const next = session.plan[Number(nextStepIndex)];
    if (!next) return null;
    return {
      currentStep: Number(nextStepIndex),
      totalSteps: session.plan.length,
      round: next.round,
      totalRounds: session.rounds,
    };
  }, [session, nextStepIndex]);

  // Navigate to next exercise
  const goToNextExercise = useCallback(() => {
    if (navigatedRef.current) return;
    navigatedRef.current = true;

    // Record the actual rest time taken
    const elapsed = Date.now() - startTimeRef.current;
    addRestTime(elapsed);

    router.replace({
      pathname: "/exercises/[exerciseId]",
      params: {
        exerciseId: nextExerciseId,
        routineId,
        stepIndex: nextStepIndex,
      },
    });
  }, [addRestTime, nextExerciseId, nextStepIndex, routineId, router]);

  // Countdown timer
  useEffect(() => {
    if (isPaused) return;

    if (remaining <= 0) {
      goToNextExercise();
      return;
    }

    const timer = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remaining, isPaused, goToNextExercise]);

  // If no session, redirect back
  useEffect(() => {
    if (!session || (routineId && session.id !== routineId)) {
      if (!navigatedRef.current) {
        navigatedRef.current = true;
        router.replace("/routine");
      }
    }
  }, [session, routineId, router]);

  const handleSkip = useCallback(() => {
    goToNextExercise();
  }, [goToNextExercise]);

  const handlePauseToggle = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  const handleAddTime = useCallback(() => {
    setRemaining((prev) => prev + 15);
  }, []);

  return (
    <TPage hasHeader backgroundColor="$background">
      <YStack
        flex={1}
        alignItems="center"
        justifyContent="center"
        gap="$6"
        paddingVertical="$6"
      >
        {/* Step indicator */}
        {stepInfo && (
          <XStack gap="$3">
            <Card
              bordered
              paddingHorizontal="$3"
              paddingVertical="$2"
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderRadius="$3"
            >
              <Text fontSize="$3" fontWeight="600" color="$color">
                {t("routineRun.chips.step")} {stepInfo.currentStep + 1}/
                {stepInfo.totalSteps}
              </Text>
            </Card>
            <Card
              bordered
              paddingHorizontal="$3"
              paddingVertical="$2"
              backgroundColor="$backgroundHover"
              borderColor="$borderColor"
              borderRadius="$3"
            >
              <Text fontSize="$3" fontWeight="600" color="$color">
                {t("routineRun.chips.round")} {stepInfo.round}/
                {stepInfo.totalRounds}
              </Text>
            </Card>
          </XStack>
        )}

        {/* Title */}
        <YStack alignItems="center" gap="$2">
          <Text fontSize="$5" fontWeight="700" color="$color">
            {t("routineRest.title")}
          </Text>
          <Text fontSize="$3" color="$placeholderColor" textAlign="center">
            {t("routineRest.subtitle")}
          </Text>
        </YStack>

        {/* Countdown circle */}
        <YStack
          width={CIRCLE_SIZE}
          height={CIRCLE_SIZE}
          alignItems="center"
          justifyContent="center"
          borderRadius={CIRCLE_SIZE / 2}
          borderWidth={STROKE_WIDTH}
          borderColor={
            (remaining <= 3 ? successColor : `${primaryColor}40`) as any
          }
          backgroundColor="$backgroundHover"
        >
          <H2
            color={remaining <= 3 ? (successColor as any) : "$color"}
            fontWeight="800"
            fontSize="$10"
          >
            {formattedTime}
          </H2>
          <Text fontSize="$2" color="$placeholderColor" marginTop="$1">
            {t("routineRest.seconds")}
          </Text>
        </YStack>

        {/* Next exercise preview */}
        <Card
          bordered
          backgroundColor="$backgroundHover"
          borderColor="$borderColor"
          padding="$4"
          borderRadius="$4"
          width="100%"
          maxWidth={320}
        >
          <XStack gap="$3" alignItems="center">
            <YStack
              width="$4"
              height="$4"
              alignItems="center"
              justifyContent="center"
              backgroundColor="$blue3"
              borderRadius="$3"
            >
              <Ionicons
                name="arrow-forward-outline"
                size={20}
                color={theme.blue11?.get() as string}
              />
            </YStack>
            <YStack flex={1} gap="$1">
              <Text fontSize="$2" fontWeight="600" color="$placeholderColor">
                {t("routineRest.nextUp")}
              </Text>
              <Text
                fontSize="$4"
                fontWeight="700"
                color="$color"
                numberOfLines={1}
              >
                {nextExerciseName}
              </Text>
            </YStack>
          </XStack>
        </Card>

        {/* Actions */}
        <YStack gap="$3" width="100%" maxWidth={320}>
          <TButton
            variant="primary"
            fullWidth
            onPress={handleSkip}
            iconName="play-skip-forward-outline"
          >
            {t("routineRest.skip")}
          </TButton>

          <XStack gap="$3">
            <TButton
              flex={1}
              variant="outline"
              onPress={handlePauseToggle}
              iconName={isPaused ? "play-outline" : "pause-outline"}
            >
              {isPaused ? t("routineRest.resume") : t("routineRest.pause")}
            </TButton>
            <TButton
              flex={1}
              variant="ghost"
              onPress={handleAddTime}
              iconName="add-outline"
            >
              {t("routineRest.addTime")}
            </TButton>
          </XStack>
        </YStack>
      </YStack>
    </TPage>
  );
};

export default RestScreen;
