import { RNMediapipe } from "@thinksys/react-native-mediapipe";
import React from "react";
import { useTranslation } from "react-i18next";
import { ScrollView, TouchableOpacity } from "react-native";

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
  const footerItems =
    (t("exercises.native.footer", { returnObjects: true }) as string[]) ?? [];

  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.native.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.native.subtitle");

  const backgroundColor = useThemeColor({}, "background");
  const surfaceColor = useThemeColor(
    { light: "#f8fafc", dark: "#0b1220" },
    "background",
  );
  const borderColor = useThemeColor(
    { light: "#e2e8f0", dark: "#1f2937" },
    "background",
  );
  const accentColor = useThemeColor({}, "tint");
  const buttonTextColor = useThemeColor(
    { light: "#0b1220", dark: "#0b1220" },
    "text",
  );
  const mutedText = useThemeColor(
    { light: "#475569", dark: "#cbd5e1" },
    "text",
  );

  return (
    <ScrollView
      style={[styles.container, { backgroundColor }]}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <ThemedView style={styles.header}>
        <ThemedText style={styles.title}>{headerTitle}</ThemedText>
        <ThemedText style={[styles.subtitle, { color: mutedText }]}>
          {headerSubtitle}
        </ThemedText>
      </ThemedView>

      <ThemedView
        style={[
          styles.cameraContainer,
          { backgroundColor: surfaceColor, borderColor },
        ]}
        lightColor="transparent"
        darkColor="transparent"
      >
        <RNMediapipe
          width={CAMERA_WIDTH}
          height={CAMERA_HEIGHT}
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

      <ThemedView style={styles.controls}>
        <TouchableOpacity
          onPress={handleSwitchCamera}
          style={[styles.button, { backgroundColor: accentColor }]}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={t("exercises.native.switchCamera.label")}
          accessibilityRole="button"
          accessibilityHint={t(
            "exercises.native.switchCamera.accessibilityHint",
          )}
        >
          <ThemedText style={[styles.buttonText, { color: buttonTextColor }]}>
            {t("exercises.native.switchCamera.label")}
          </ThemedText>
        </TouchableOpacity>

        <ThemedView
          style={[
            styles.statsContainer,
            { backgroundColor: surfaceColor, borderColor },
          ]}
        >
          <ThemedView style={styles.statRow}>
            <ThemedText style={[styles.statLabel, { color: mutedText }]}>
              {t("exercises.native.stats.status")}:
            </ThemedText>
            <ThemedText style={styles.statValue}>
              {t(`exercises.statuses.${status}`)}
            </ThemedText>
          </ThemedView>
          <ThemedView style={styles.statRow}>
            <ThemedText style={[styles.statLabel, { color: mutedText }]}>
              {t("exercises.native.stats.poses")}:
            </ThemedText>
            <ThemedText style={styles.statValue}>{poseCount}</ThemedText>
          </ThemedView>
          {typeof repCount === "number" && (
            <ThemedView style={styles.statRow}>
              <ThemedText style={[styles.statLabel, { color: mutedText }]}>
                {t("exercises.native.stats.reps")}:
              </ThemedText>
              <ThemedText style={styles.statValue}>{repCount}</ThemedText>
            </ThemedView>
          )}
          <ThemedText style={[styles.message, { color: mutedText }]}>
            {feedback ?? t(`exercises.messages.${messageKey}`)}
          </ThemedText>
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.footer}>
        {footerItems.map((item) => (
          <ThemedText
            key={item}
            style={[styles.footerText, { color: mutedText }]}
          >
            • {item}
          </ThemedText>
        ))}
      </ThemedView>
    </ScrollView>
  );
}
