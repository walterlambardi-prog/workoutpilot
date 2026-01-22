import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import type { ExercisesProps } from "./exercises.types";
import { rnStyles, webMediaStyles } from "./exercises.web.styles";
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
  const autoStartAttemptedRef = useRef(false);
  const advanceRef = useRef(false);
  const lastStepIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "ready" || autoStartAttemptedRef.current) {
      return;
    }

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

    if (stepChanged && (repCount ?? 0) > 0) {
      return;
    }

    if (stepChanged) {
      lastStepIndexRef.current = routineStepIndex;
    }

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

  const pageBackground = useThemeColor({}, "background");
  const heroBorder = useThemeColor(
    { light: "rgba(249, 252, 255, 0.4)", dark: "rgba(15, 23, 42, 0.65)" },
    "background",
  );
  const scrimColor = useThemeColor(
    { light: "rgba(0, 0, 0, 0.80)", dark: "rgba(15,23,42,0.45)" },
    //{ light: "rgba(7,12,22,0.55)", dark: "rgba(15,23,42,0.45)" },
    "background",
  );
  const cardBackground = useThemeColor(
    { light: "rgba(255,255,255,0.25)", dark: "rgba(15,23,42,0.45)" },
    "background",
  );
  const overlayBorder = useThemeColor(
    { light: "rgba(15,23,42,0.15)", dark: "rgba(248,250,252,0.12)" },
    "background",
  );
  const overlayHeading = useThemeColor(
    { light: "#f8fafc", dark: "#f8fafc" },
    "text",
  );
  const overlayMuted = useThemeColor(
    { light: "rgba(226,232,240,0.9)", dark: "rgba(148,163,184,0.9)" },
    "text",
  );
  const messageColor = useThemeColor(
    { light: "#e2e8f0", dark: "#cbd5f5" },
    "text",
  );

  const heroChips = useMemo(() => {
    const chips = [
      {
        key: "status",
        label: t("exercises.web.status"),
        value: t(`exercises.statuses.${status}`),
      },
    ];

    if (typeof stats?.poseCount === "number") {
      chips.push({
        key: "poses",
        label: t("exercises.web.poseCount"),
        value: String(stats.poseCount),
      });
    }

    if (typeof stats?.repCount === "number") {
      chips.push({
        key: "reps",
        label: t("exercises.web.reps"),
        value: String(stats.repCount),
      });
    }

    if (routineContext?.isActive && routineContext.targetReps > 0) {
      const safeProgress = Math.max(
        0,
        Math.min(routineContext.targetReps, stats?.repCount ?? 0),
      );

      chips.push({
        key: "target",
        label: t("routineRun.chips.target"),
        value: `${safeProgress}/${routineContext.targetReps}`,
      });

      chips.push({
        key: "round",
        label: t("routineRun.chips.round"),
        value: t("routineRun.chips.roundValue", {
          current: routineContext.currentRound,
          total: routineContext.totalRounds,
        }),
      });

      chips.push({
        key: "step",
        label: t("routineRun.chips.step"),
        value: t("routineRun.chips.stepValue", {
          current: routineContext.stepIndex + 1,
          total: routineContext.totalSteps,
        }),
      });
    }

    return chips;
  }, [routineContext, stats?.poseCount, stats?.repCount, status, t]);

  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.web.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.web.subtitle");

  const routineProgress = useMemo(() => {
    if (!routineContext?.isActive || routineContext.targetReps <= 0) {
      return null;
    }

    const completed = Math.max(
      0,
      Math.min(routineContext.targetReps, stats?.repCount ?? 0),
    );
    const ratio = Math.min(1, completed / routineContext.targetReps);

    return { completed, target: routineContext.targetReps, ratio };
  }, [routineContext, stats?.repCount]);

  const nextExerciseTitle = useMemo(() => {
    if (!routineContext?.nextExerciseId) return null;
    const nextKey = EXERCISE_COPY_KEYS[routineContext.nextExerciseId];
    return t(`${nextKey}.title`);
  }, [routineContext?.nextExerciseId, t]);

  return (
    <ThemedView
      style={[rnStyles.screen, { backgroundColor: pageBackground }]}
      lightColor="transparent"
      darkColor="transparent"
    >
      <ThemedView
        style={rnStyles.content}
        lightColor="transparent"
        darkColor="transparent"
      >
        <ThemedView
          style={[rnStyles.hero, { borderColor: heroBorder }]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedView style={rnStyles.mediaLayer} pointerEvents="none">
            <ThemedView style={rnStyles.mediaFrame} pointerEvents="none">
              <video
                ref={videoRef}
                style={webMediaStyles.video}
                playsInline
                muted
              />
              <ThemedView
                style={[rnStyles.mediaTint, { backgroundColor: scrimColor }]}
                pointerEvents="none"
              />
              <canvas ref={canvasRef} style={webMediaStyles.canvas} />
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={rnStyles.overlayLayer}
            pointerEvents="box-none"
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={rnStyles.overlayTop}
              pointerEvents="none"
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedView
                style={[
                  rnStyles.headerBlock,
                  {
                    backgroundColor: cardBackground,
                    borderColor: overlayBorder,
                  },
                ]}
                pointerEvents="none"
              >
                <ThemedText style={[rnStyles.title, { color: overlayHeading }]}>
                  {headerTitle}
                </ThemedText>
                <ThemedText
                  style={[rnStyles.subtitle, { color: messageColor }]}
                >
                  {headerSubtitle}
                </ThemedText>
              </ThemedView>

              <ThemedView
                style={rnStyles.chipRow}
                pointerEvents="none"
                lightColor="transparent"
                darkColor="transparent"
              >
                {heroChips.map((chip) => (
                  <ThemedView
                    key={chip.key}
                    style={[
                      rnStyles.chip,
                      {
                        borderColor: overlayBorder,
                        backgroundColor: cardBackground,
                      },
                    ]}
                    lightColor="transparent"
                    darkColor="transparent"
                  >
                    <ThemedText
                      style={[rnStyles.chipLabel, { color: overlayMuted }]}
                    >
                      {chip.label}
                    </ThemedText>
                    <ThemedText
                      style={[rnStyles.chipValue, { color: overlayHeading }]}
                    >
                      {chip.value}
                    </ThemedText>
                  </ThemedView>
                ))}
              </ThemedView>
            </ThemedView>

            <ThemedView
              style={[
                rnStyles.overlayBottom,
                {
                  backgroundColor: cardBackground,
                  borderColor: overlayBorder,
                },
              ]}
              lightColor="transparent"
              darkColor="transparent"
            >
              {routineProgress ? (
                <ThemedView
                  style={rnStyles.progressCard}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedView style={rnStyles.progressTrack}>
                    <ThemedView
                      style={[
                        rnStyles.progressFill,
                        {
                          width: `${Math.min(100, Math.max(0, routineProgress.ratio * 100))}%`,
                          backgroundColor: overlayHeading,
                        },
                      ]}
                    />
                  </ThemedView>

                  {nextExerciseTitle ? (
                    <ThemedText
                      style={[rnStyles.nextExercise, { color: overlayMuted }]}
                      numberOfLines={1}
                    >
                      {t("routineRun.nextExercise", {
                        exercise: nextExerciseTitle,
                      })}
                    </ThemedText>
                  ) : null}
                </ThemedView>
              ) : null}

              <ThemedText style={[rnStyles.message, { color: overlayMuted }]}>
                {stats?.feedback ?? t(`exercises.messages.${messageKey}`)}
              </ThemedText>
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
