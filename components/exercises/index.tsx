import { RNMediapipe } from "@thinksys/react-native-mediapipe";
import React from "react";
import { useTranslation } from "react-i18next";
import { Text, TouchableOpacity, View } from "react-native";

import { EXERCISE_COPY_KEYS, ExerciseId } from "@/constants/exercises";

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
  const { status, messageKey, poseCount, handleLandmark, handleSwitchCamera } =
    usePoseDetection();
  const footerItems =
    (t("exercises.native.footer", { returnObjects: true }) as string[]) ?? [];

  const copyKey = exerciseId ? EXERCISE_COPY_KEYS[exerciseId] : undefined;
  const headerTitle = copyKey
    ? t(`${copyKey}.title`)
    : t("exercises.native.title");
  const headerSubtitle = copyKey
    ? t(`${copyKey}.description`)
    : t("exercises.native.subtitle");

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{headerTitle}</Text>
        <Text style={styles.subtitle}>{headerSubtitle}</Text>
      </View>

      <View style={styles.cameraContainer}>
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
      </View>

      <View style={styles.controls}>
        <TouchableOpacity
          onPress={handleSwitchCamera}
          style={styles.button}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel={t("exercises.native.switchCamera.label")}
          accessibilityRole="button"
          accessibilityHint={t(
            "exercises.native.switchCamera.accessibilityHint",
          )}
        >
          <Text style={styles.buttonText}>
            {t("exercises.native.switchCamera.label")}
          </Text>
        </TouchableOpacity>

        <View style={styles.statsContainer}>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>
              {t("exercises.native.stats.status")}:
            </Text>
            <Text style={styles.statValue}>
              {t(`exercises.statuses.${status}`)}
            </Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.statLabel}>
              {t("exercises.native.stats.poses")}:
            </Text>
            <Text style={styles.statValue}>{poseCount}</Text>
          </View>
          <Text style={styles.message}>
            {t(`exercises.messages.${messageKey}`)}
          </Text>
        </View>
      </View>

      <View style={styles.footer}>
        {footerItems.map((item) => (
          <Text key={item} style={styles.footerText}>
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
}
