import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Card,
  Separator,
  Text,
  Theme,
  XStack,
  YStack,
  useMedia,
} from "tamagui";

import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import type { ExercisesProps } from "./exercises.types";
import { webMediaStyles } from "./exercises.web.styles";
import { useWebPoseDetection } from "./hooks/useWebPoseDetection";

/**
 * Web exercises screen with MediaPipe pose detection
 * Uses @mediapipe/tasks-vision for browser-based pose detection
 */
export default function ExercisesWebScreen({
  exerciseId,
  routineContext,
}: ExercisesProps) {
  const {
    status,
    messageKey,
    stats,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  } = useWebPoseDetection(exerciseId, routineContext?.stepIndex);

  const { t } = useTranslation();
  const media = useMedia();

  const autoStartAttemptedRef = useRef(false);
  const advanceRef = useRef(false);
  const lastStepIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "ready" || autoStartAttemptedRef.current) return;
    autoStartAttemptedRef.current = true;
    startCamera();
  }, [status, startCamera]);

  useEffect(() => {
    return () => {
      autoStartAttemptedRef.current = false;
      stopCamera();
    };
  }, [stopCamera]);

  useEffect(() => {
    advanceRef.current = false;
  }, [exerciseId, routineContext?.routineId, routineContext?.stepIndex]);

  const routineIsActive = routineContext?.isActive ?? false;
  const routineStepIndex = routineContext?.stepIndex ?? null;
  const routineTargetReps = routineContext?.targetReps ?? 0;
  const routineOnProgress = routineContext?.onProgress;
  const routineOnComplete = routineContext?.onComplete;
  const repCount = stats?.repCount;

  useEffect(() => {
    if (!routineIsActive) {
      lastStepIndexRef.current = null;
      return;
    }

    const stepChanged = routineStepIndex !== lastStepIndexRef.current;

    if (stepChanged && (repCount ?? 0) > 0) return;

    if (stepChanged) lastStepIndexRef.current = routineStepIndex;

    if (typeof repCount !== "number") return;

    routineOnProgress?.(repCount);

    if (repCount >= routineTargetReps && routineTargetReps > 0) {
      if (!advanceRef.current) {
        advanceRef.current = true;
        routineOnComplete?.(repCount);
      }
    } else {
      advanceRef.current = false;
    }
  }, [
    repCount,
    routineIsActive,
    routineOnComplete,
    routineOnProgress,
    routineStepIndex,
    routineTargetReps,
  ]);

  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.web.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.web.subtitle");

  const primaryChip = useMemo(() => {
    if (routineContext?.isActive && routineContext.targetReps > 0) {
      const safeProgress = Math.max(
        0,
        Math.min(routineContext.targetReps, stats?.repCount ?? 0),
      );
      return {
        key: "target",
        label: t("routineRun.chips.target"),
        value: `${safeProgress}/${routineContext.targetReps}`,
      };
    }

    if (typeof stats?.repCount === "number") {
      return {
        key: "reps",
        label: t("exercises.web.reps"),
        value: String(stats.repCount),
      };
    }

    return null;
  }, [routineContext, stats?.repCount, t]);

  const heroChips = useMemo(() => {
    if (routineContext?.isActive && routineContext.targetReps > 0) {
      return [
        {
          key: "round",
          label: t("routineRun.chips.round"),
          value: `${routineContext.currentRound}/${routineContext.totalRounds}`,
        },
        {
          key: "step",
          label: t("routineRun.chips.step"),
          value: `${routineContext.stepIndex + 1}/${routineContext.totalSteps}`,
        },
      ];
    }
    return [];
  }, [routineContext, t]);

  const progress = useMemo(() => {
    if (!routineContext?.isActive || !routineContext.targetReps) return null;

    const completed = Math.max(
      0,
      Math.min(routineContext.targetReps, stats?.repCount ?? 0),
    );
    const target = routineContext.targetReps;
    const ratio = target > 0 ? completed / target : 0;

    let nextExerciseTitle: string | null = null;
    if (routineContext.nextExerciseId) {
      const nextCopyKey = EXERCISE_COPY_KEYS[routineContext.nextExerciseId];
      nextExerciseTitle = nextCopyKey ? t(`${nextCopyKey}.title`) : null;
    }

    return { completed, target, ratio, nextExerciseTitle };
  }, [routineContext, stats?.repCount, t]);

  const heroTitleSize = media.md ? 34 : 28;
  const heroSubtitleSize = media.md ? 18 : 16;

  const overlayPadding = media.md ? "$6" : "$4";
  const topRightPadding = media.lg ? "22%" : media.md ? "10%" : "0%";

  const isCameraRunning = status === "running";

  return (
    <Theme name="dark">
      <YStack f={1} w="100%" bg="$background" position="relative" ov="hidden">
        {/* Media background */}
        <YStack
          w="100%"
          h="100%"
          position="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          zIndex={0}
        >
          <video
            ref={videoRef}
            style={webMediaStyles.video}
            playsInline
            muted
          />
          <canvas ref={canvasRef} style={webMediaStyles.canvas} />

          <YStack
            position="absolute"
            t={0}
            l={0}
            r={0}
            b={0}
            zIndex={2}
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.25) 35%, rgba(0,0,0,0.65) 100%)",
            }}
          />
        </YStack>

        {/* Overlay UI */}
        <YStack
          position="absolute"
          t={0}
          l={0}
          r={0}
          b={0}
          p={overlayPadding}
          jc="space-between"
          pointerEvents="box-none"
          zIndex={3}
          bg="transparent"
          gap="$4"
        >
          {/* Top content */}
          <YStack gap="$4" pr={topRightPadding} pointerEvents="box-none">
            <Card
              bordered
              p={media.md ? "$6" : "$5"}
              borderRadius="$6"
              borderWidth={1}
              borderColor="$borderColor"
              style={{
                backgroundColor: "rgba(20, 20, 24, 0.55)",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
              }}
            >
              <YStack gap="$3">
                <XStack ai="center" jc="space-between" gap="$3" flexWrap="wrap">
                  <Text
                    fontSize={heroTitleSize}
                    fontWeight="800"
                    color="$color"
                  >
                    {headerTitle}
                  </Text>

                  <Card
                    bordered
                    p="$2"
                    br="$6"
                    borderColor="$borderColor"
                    style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="700"
                      color="$color"
                      o={0.85}
                    >
                      {t(`exercises.messages.${messageKey}`)}
                    </Text>
                  </Card>
                </XStack>

                <Text fontSize={heroSubtitleSize} color="$color" o={0.82}>
                  {headerSubtitle}
                </Text>

                <Separator o={0.6} />

                <XStack ai="center" gap="$3" flexWrap="wrap">
                  <Button
                    size="$3"
                    backgroundColor="$primary"
                    color="$onPrimary"
                    borderColor="$primary"
                    onPress={isCameraRunning ? stopCamera : startCamera}
                    disabled={status === "loading"}
                  >
                    {isCameraRunning ? "Stop camera" : "Start camera"}
                  </Button>

                  <Card
                    bordered
                    p="$3"
                    br="$5"
                    borderColor="$borderColor"
                    style={{ backgroundColor: "rgba(0,0,0,0.25)" }}
                  >
                    <Text fontSize={13} color="$color" o={0.78}>
                      {stats?.feedback ?? t(`exercises.messages.${messageKey}`)}
                    </Text>
                  </Card>
                </XStack>
              </YStack>
            </Card>

            {primaryChip ? (
              <Card
                bordered
                p="$4"
                borderRadius="$6"
                borderWidth={2}
                borderColor="$primary"
                alignSelf="flex-start"
                style={{
                  backgroundColor: "rgba(10, 10, 14, 0.55)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                }}
              >
                <Text
                  fontSize={13}
                  fontWeight="800"
                  color="$color"
                  ls={1}
                  tt="uppercase"
                  mb={4}
                  o={0.8}
                >
                  {primaryChip.label}
                </Text>
                <Text
                  fontSize={media.md ? 44 : 38}
                  fontWeight="900"
                  color="$color"
                >
                  {primaryChip.value}
                </Text>
              </Card>
            ) : null}

            {heroChips.length ? (
              <XStack gap="$3" flexWrap="wrap">
                {heroChips.map((chip) => (
                  <Card
                    key={chip.key}
                    bordered
                    p="$3"
                    borderRadius="$5"
                    borderWidth={1}
                    borderColor="$borderColor"
                    style={{
                      backgroundColor: "rgba(20, 20, 24, 0.50)",
                      backdropFilter: "blur(10px)",
                      WebkitBackdropFilter: "blur(10px)",
                    }}
                  >
                    <Text
                      fontSize={12}
                      fontWeight="700"
                      color="$color"
                      ls={0.8}
                      tt="uppercase"
                      mb={2}
                      o={0.8}
                    >
                      {chip.label}
                    </Text>
                    <Text fontSize={18} fontWeight="800" color="$color">
                      {chip.value}
                    </Text>
                  </Card>
                ))}
              </XStack>
            ) : null}
          </YStack>

          {/* Bottom card */}
          {routineIsActive && (
            <YStack
              gap="$4"
              borderRadius="$6"
              p={media.md ? "$6" : "$5"}
              borderColor="$borderColor"
              borderWidth={1}
              ai="stretch"
              style={{
                backgroundColor: "rgba(20, 20, 24, 0.55)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                maxWidth: 560,
              }}
            >
              {progress ? (
                <YStack gap="$3">
                  <XStack jc="space-between" ai="center">
                    <Text fontSize={15} fontWeight="700" color="$color">
                      {t("routineRun.progressLabel", {
                        current: progress.completed,
                        target: progress.target,
                      })}
                    </Text>
                    <Text fontSize={15} fontWeight="800" color="$color">
                      {Math.round(progress.ratio * 100)}%
                    </Text>
                  </XStack>

                  <YStack w="100%" h={10} br={999} ov="hidden">
                    <YStack
                      h="100%"
                      br={999}
                      bg="$primary"
                      w={`${Math.min(100, Math.max(0, progress.ratio * 100))}%`}
                    />
                  </YStack>

                  {progress.nextExerciseTitle ? (
                    <Text
                      fontSize={13}
                      fontWeight="700"
                      color="$color"
                      o={0.7}
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {t("routineRun.nextExercise", {
                        exercise: progress.nextExerciseTitle,
                      })}
                    </Text>
                  ) : null}
                </YStack>
              ) : null}
            </YStack>
          )}
        </YStack>
      </YStack>
    </Theme>
  );
}
