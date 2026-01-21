import { RNMediapipe } from "@thinksys/react-native-mediapipe";
import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { TouchableOpacity, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { EXERCISE_COPY_KEYS, ExerciseId } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";

import { CAMERA_HEIGHT, CAMERA_WIDTH } from "./exercises.constants";
import styles from "./exercises.styles";
import { usePoseDetection } from "./hooks/usePoseDetection";

/**
 * Native exercises screen with MediaPipe pose detection
 * Uses @thinksys/react-native-mediapipe for iOS/Android
 */
export interface ExercisesProps {
  exerciseId?: ExerciseId;
}

export default function ExercisesNativeScreen({ exerciseId }: ExercisesProps) {
  const { t } = useTranslation();
  const {
    status,
    messageKey,
    poseCount,
    repCount,
    feedback,
    handleLandmark,
    handleSwitchCamera,
  } = usePoseDetection({ exerciseId, t });

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
    { light: "rgba(7,12,22,0.55)", dark: "rgba(2,6,23,0.7)" },
    "background",
  );
  const overlaySurface = useThemeColor(
    { light: "transparent", dark: "transparent" },
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
  const chipBackground = useThemeColor(
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

  const statChips = useMemo(() => {
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

    if (typeof repCount === "number") {
      chips.push({
        key: "reps",
        label: t("exercises.native.stats.reps"),
        value: String(repCount),
      });
    }

    return chips;
  }, [poseCount, repCount, status, t]);

  return (
    <ThemedView style={styles.screen} lightColor="#000" darkColor="#000">
      <ThemedView style={styles.cameraWrapper} pointerEvents="none">
        <RNMediapipe
          width={cameraWidth}
          height={cameraHeight}
          onLandmark={handleLandmark}
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
              style={styles.headerBlock}
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

            <ThemedView
              style={styles.chipRow}
              pointerEvents="box-none"
              lightColor="transparent"
              darkColor="transparent"
            >
              {statChips.map((chip) => (
                <ThemedView
                  key={chip.key}
                  style={[styles.chip, { backgroundColor: chipBackground }]}
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
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>
          </ThemedView>

          <ThemedView
            style={[
              styles.bottomCard,
              { backgroundColor: overlaySurface, borderColor: overlayBorder },
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
