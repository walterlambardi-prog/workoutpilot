import React from "react";
import { useTranslation } from "react-i18next";

import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { EXERCISE_COPY_KEYS, ExerciseId } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { buttonStyles, rnStyles, webMediaStyles } from "./exercises.web.styles";
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

  const pageBackground = useThemeColor({}, "background");

  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.web.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.web.subtitle");

  const startLabel =
    status === "loading"
      ? t("exercises.web.buttons.loading")
      : status === "running"
        ? t("exercises.web.buttons.processing")
        : status === "ready"
          ? t("exercises.web.buttons.start")
          : t("exercises.web.buttons.starting");

  return (
    <ThemedView
      style={[rnStyles.page, { backgroundColor: pageBackground }]}
      lightColor="transparent"
      darkColor="transparent"
    >
      <ThemedView
        style={[rnStyles.card]}
        lightColor="transparent"
        darkColor="transparent"
      >
        <ThemedView style={rnStyles.header}>
          <ThemedText style={rnStyles.title} type="title">
            {headerTitle}
          </ThemedText>
          <ThemedText style={[rnStyles.subtitle]}>{headerSubtitle}</ThemedText>
        </ThemedView>

        <ThemedView style={rnStyles.row}>
          <ThemedView
            style={[rnStyles.actions]}
            lightColor="transparent"
            darkColor="transparent"
          >
            <button
              onClick={startCamera}
              disabled={status !== "ready"}
              style={{
                ...buttonStyles.primary,
                marginBottom: 12,
              }}
              aria-label={t("exercises.web.aria.start")}
            >
              {startLabel}
            </button>
            <button
              onClick={stopCamera}
              disabled={status !== "running"}
              style={{
                ...buttonStyles.primary,
                marginBottom: 12,
              }}
              aria-label={t("exercises.web.aria.stop")}
            >
              {t("exercises.web.stop")}
            </button>
            <ThemedText style={[rnStyles.status, { marginBottom: 8 }]}>
              <strong>{t("exercises.web.status")}:</strong>{" "}
              {t(`exercises.statuses.${status}`)}
            </ThemedText>
            <ThemedText style={[rnStyles.message, { marginBottom: 8 }]}>
              {stats?.feedback ?? t(`exercises.messages.${messageKey}`)}
            </ThemedText>
            {stats && (
              <ThemedView style={rnStyles.statsBox}>
                {typeof stats.poseCount === "number" && (
                  <ThemedText style={{ marginRight: 12 }}>
                    <strong>{t("exercises.web.poseCount")}:</strong>{" "}
                    {stats.poseCount}
                  </ThemedText>
                )}
                {typeof stats.repCount === "number" && (
                  <ThemedText>
                    <strong>{t("exercises.web.reps")}:</strong> {stats.repCount}
                  </ThemedText>
                )}
              </ThemedView>
            )}
          </ThemedView>

          <ThemedView style={rnStyles.overlayColumn}>
            <ThemedView
              style={rnStyles.videoShell}
              lightColor="transparent"
              darkColor="transparent"
            >
              <video
                ref={videoRef}
                style={webMediaStyles.video}
                playsInline
                muted
              />
              <canvas ref={canvasRef} style={webMediaStyles.canvas} />
            </ThemedView>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
