import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useWindowDimensions } from "react-native";

import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { EXERCISE_COPY_KEYS, ExerciseId } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { rnStyles, webMediaStyles } from "./exercises.web.styles";
import { useWebPoseDetection } from "./hooks/useWebPoseDetection";

/**
 * Web exercises screen with MediaPipe pose detection
 * Uses @mediapipe/tasks-vision for browser-based pose detection
 */
export interface ExercisesProps {
  exerciseId?: ExerciseId;
}

export default function ExercisesWebScreen({ exerciseId }: ExercisesProps) {
  const {
    status,
    messageKey,
    stats,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  } = useWebPoseDetection(exerciseId);
  const { t } = useTranslation();
  const autoStartAttemptedRef = useRef(false);
  const { height: viewportHeight } = useWindowDimensions();
  const heroHeight = Math.max(viewportHeight - 100, 640);

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

  const pageBackground = useThemeColor({}, "background");
  const heroBorder = useThemeColor(
    { light: "rgba(249, 252, 255, 0.4)", dark: "rgba(15, 23, 42, 0.65)" },
    "background",
  );
  const scrimColor = useThemeColor(
    { light: "rgba(7,12,22,0.55)", dark: "rgba(15,23,42,0.45)" },
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

    return chips;
  }, [stats?.poseCount, stats?.repCount, status, t]);

  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.web.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.web.subtitle");

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
          style={[
            rnStyles.hero,
            { borderColor: heroBorder, minHeight: heroHeight },
          ]}
          lightColor="transparent"
          darkColor="transparent"
        >
          <ThemedView
            style={[rnStyles.mediaLayer, { minHeight: heroHeight }]}
            pointerEvents="none"
          >
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
