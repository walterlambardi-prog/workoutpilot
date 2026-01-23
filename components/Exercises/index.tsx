import { RNMediapipe } from "@thinksys/react-native-mediapipe";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";

import { CAMERA_HEIGHT, CAMERA_WIDTH } from "./exercises.constants";
import styles from "./exercises.styles";
import type { ExercisesProps } from "./exercises.types";
import { usePoseDetection } from "./hooks/usePoseDetection";

/**
 * Native exercises screen with MediaPipe pose detection
 * Uses @thinksys/react-native-mediapipe for iOS/Android
 */

export default function ExercisesNativeScreen({
  exerciseId,
  routineContext,
}: ExercisesProps) {
  const screenKey = `${exerciseId ?? "unknown"}-${routineContext?.stepIndex ?? "solo"}`;
  const [showCamera, setShowCamera] = useState(false);
  const [cameraSessionKey, setCameraSessionKey] = useState(0);
  const isFirstRenderRef = useRef(true);
  const remountTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { t } = useTranslation();
  const {
    status,
    messageKey,
    poseCount,
    repCount,
    feedback,
    handleLandmark,
    handleSwitchCamera,
  } = usePoseDetection({
    exerciseId,
    t,
    resetKey: routineContext?.stepIndex,
  });

  const advanceRef = useRef(false);
  const lastStepIndexRef = useRef<number | null>(null);

  useEffect(() => {
    advanceRef.current = false;
  }, [exerciseId, routineContext?.routineId, routineContext?.stepIndex]);

  // Force RNMediapipe to unmount/remount when the routine step/exercise changes
  // to restart the native camera session reliably. Avoid double init on first
  // mount and ensure we never leave the camera hidden if the effect cleans up.
  useEffect(() => {
    if (remountTimerRef.current) {
      clearTimeout(remountTimerRef.current);
    }

    const delay = isFirstRenderRef.current ? 220 : 300;
    isFirstRenderRef.current = false;

    setShowCamera(false);
    remountTimerRef.current = setTimeout(() => {
      setCameraSessionKey((prev) => prev + 1);
      setShowCamera(true);
    }, delay);

    return () => {
      if (remountTimerRef.current) {
        clearTimeout(remountTimerRef.current);
        remountTimerRef.current = null;
      }
      setShowCamera(true);
    };
  }, [screenKey]);

  useEffect(() => {
    return () => {
      if (remountTimerRef.current) {
        clearTimeout(remountTimerRef.current);
      }
      setShowCamera(true);
    };
  }, []);

  const routineIsActive = routineContext?.isActive ?? false;
  const routineStepIndex = routineContext?.stepIndex ?? null;
  const routineTargetReps = routineContext?.targetReps ?? 0;
  const routineOnProgress = routineContext?.onProgress;
  const routineOnComplete = routineContext?.onComplete;

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

  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.native.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.native.subtitle");

  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const cameraWidth = Math.max(width, CAMERA_WIDTH);
  const cameraHeight = Math.max(height, CAMERA_HEIGHT);

  const scrimColor = useThemeColor(
    { light: "rgba(7,12,22,0)", dark: "rgba(15,23,42,0.45)" },
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
  const cardBackground = useThemeColor(
    { light: "rgba(255,255,255,0.25)", dark: "rgba(15,23,42,0.45)" },
    "background",
  );
  const messageColor = useThemeColor(
    { light: "#e2e8f0", dark: "#cbd5f5" },
    "text",
  );
  const accentColor = useThemeColor({}, "tint");
  const buttonTextColor = useThemeColor(
    { light: "#0b1220", dark: "#0b1220" },
    "text",
  );

  const primaryChip = useMemo(() => {
    if (routineContext?.isActive && routineContext.targetReps > 0) {
      const safeProgress = Math.max(
        0,
        Math.min(routineContext.targetReps, repCount ?? 0),
      );
      return {
        key: "target",
        label: t("routineRun.chips.target"),
        value: `${safeProgress}/${routineContext.targetReps}`,
      };
    }

    if (typeof repCount === "number") {
      return {
        key: "reps",
        label: t("exercises.native.stats.reps"),
        value: String(repCount),
      };
    }

    return null;
  }, [routineContext, repCount, t]);

  const heroChips = useMemo(() => {
    const chips = [
      {
        key: "status",
        label: t("exercises.native.stats.status"),
        value: t(`exercises.statuses.${status}`),
      },
      {
        key: "poses",
        label: t("exercises.native.stats.poses"),
        value: String(poseCount ?? 0),
      },
    ];

    if (routineContext?.isActive && routineContext.targetReps > 0) {
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
  }, [poseCount, routineContext, status, t]);

  const routineProgress = useMemo(() => {
    if (!routineContext?.isActive || routineContext.targetReps <= 0) {
      return null;
    }

    const completed = Math.max(
      0,
      Math.min(routineContext.targetReps, repCount ?? 0),
    );
    const ratio = Math.min(1, completed / routineContext.targetReps);

    return { completed, target: routineContext.targetReps, ratio };
  }, [repCount, routineContext]);

  const nextExerciseTitle = useMemo(() => {
    if (!routineContext?.nextExerciseId) return null;
    const nextKey = EXERCISE_COPY_KEYS[routineContext.nextExerciseId];
    return t(`${nextKey}.title`);
  }, [routineContext?.nextExerciseId, t]);

  return (
    <ThemedView style={styles.screen} lightColor="#000" darkColor="#000">
      <ThemedView style={styles.cameraWrapper} pointerEvents="none">
        {showCamera ? (
          <RNMediapipe
            key={cameraSessionKey}
            width={cameraWidth}
            height={cameraHeight}
            onLandmark={handleLandmark}
            cameraOverlayColor={scrimColor}
            face={true}
            leftArm={true}
            rightArm={true}
            leftWrist={true}
            rightWrist={true}
            torso={true}
            leftLeg={true}
            rightLeg={true}
            leftAnkle={true}
            rightAnkle={true}
          />
        ) : null}
      </ThemedView>

      <ThemedView
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + 24,
            paddingBottom: insets.bottom + 32,
          },
        ]}
        lightColor="transparent"
        darkColor="transparent"
        pointerEvents="box-none"
      >
        <ThemedView
          style={[styles.scrim, { backgroundColor: scrimColor }]}
          lightColor="transparent"
          darkColor="transparent"
          pointerEvents="none"
        />

        <ThemedView
          style={styles.overlayContent}
          pointerEvents="box-none"
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedView
            style={styles.topSection}
            pointerEvents="box-none"
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedView
              style={[styles.headerBlock, { backgroundColor: cardBackground }]}
              pointerEvents="none"
              lightColor="transparent"
              darkColor="transparent"
            >
              <ThemedText style={[styles.heading, { color: overlayHeading }]}>
                {headerTitle}
              </ThemedText>
              <ThemedText style={[styles.subheading, { color: messageColor }]}>
                {headerSubtitle}
              </ThemedText>
            </ThemedView>

            {primaryChip ? (
              <ThemedView
                style={styles.primaryChipRow}
                pointerEvents="none"
                lightColor="transparent"
                darkColor="transparent"
              >
                <ThemedView
                  style={[
                    styles.primaryChip,
                    {
                      borderColor: overlayHeading,
                      backgroundColor: cardBackground,
                    },
                  ]}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={[styles.primaryChipLabel, { color: overlayMuted }]}
                  >
                    {primaryChip.label}
                  </ThemedText>
                  <ThemedText
                    style={[styles.primaryChipValue, { color: overlayHeading }]}
                  >
                    {primaryChip.value}
                  </ThemedText>
                </ThemedView>
              </ThemedView>
            ) : null}

            <ThemedView
              style={styles.chipRow}
              pointerEvents="box-none"
              lightColor="transparent"
              darkColor="transparent"
            >
              {heroChips.map((chip) => (
                <ThemedView
                  key={chip.key}
                  style={[styles.chip, { backgroundColor: cardBackground }]}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={[styles.chipLabel, { color: overlayMuted }]}
                  >
                    {chip.label}
                  </ThemedText>
                  <ThemedText
                    style={[styles.chipValue, { color: overlayHeading }]}
                  >
                    {chip.value}

                    {routineProgress ? (
                      <ThemedView
                        style={[
                          styles.progressCard,
                          { borderColor: overlayBorder },
                        ]}
                        lightColor="transparent"
                        darkColor="transparent"
                      >
                        <ThemedView
                          style={styles.progressHeader}
                          lightColor="transparent"
                          darkColor="transparent"
                        >
                          <ThemedText
                            style={[
                              styles.progressLabel,
                              { color: overlayHeading },
                            ]}
                          >
                            {t("routineRun.progressLabel", {
                              current: routineProgress.completed,
                              target: routineProgress.target,
                            })}
                          </ThemedText>
                          <ThemedText
                            style={[
                              styles.progressValue,
                              { color: overlayHeading },
                            ]}
                          >
                            {Math.round(routineProgress.ratio * 100)}%
                          </ThemedText>
                        </ThemedView>

                        <ThemedView
                          style={styles.progressTrack}
                          lightColor="transparent"
                          darkColor="transparent"
                        >
                          <ThemedView
                            style={[
                              styles.progressFill,
                              {
                                width: `${Math.min(100, Math.max(0, routineProgress.ratio * 100))}%`,
                                backgroundColor: accentColor,
                              },
                            ]}
                            lightColor="transparent"
                            darkColor="transparent"
                          />
                        </ThemedView>

                        {nextExerciseTitle ? (
                          <ThemedText
                            style={[
                              styles.nextExercise,
                              { color: overlayMuted },
                            ]}
                            numberOfLines={1}
                          >
                            {t("routineRun.nextExercise", {
                              exercise: nextExerciseTitle,
                            })}
                          </ThemedText>
                        ) : null}
                      </ThemedView>
                    ) : null}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={[
              styles.bottomCard,
              { backgroundColor: cardBackground, borderColor: overlayBorder },
            ]}
            lightColor="transparent"
            darkColor="transparent"
          >
            <ThemedText style={[styles.message, { color: overlayMuted }]}>
              {feedback ?? t(`exercises.messages.${messageKey}`)}
            </ThemedText>

            <TouchableOpacity
              onPress={handleSwitchCamera}
              style={[styles.switchButton, { backgroundColor: accentColor }]}
              activeOpacity={0.85}
              accessible={true}
              accessibilityLabel={t("exercises.native.switchCamera.label")}
              accessibilityRole="button"
              accessibilityHint={t(
                "exercises.native.switchCamera.accessibilityHint",
              )}
            >
              <ThemedText
                style={[styles.switchButtonText, { color: buttonTextColor }]}
              >
                {t("exercises.native.switchCamera.label")}
              </ThemedText>
            </TouchableOpacity>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
