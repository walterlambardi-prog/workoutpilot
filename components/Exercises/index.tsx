import { RNMediapipe } from "@thinksys/react-native-mediapipe";
import React from "react";
import { useTranslation } from "react-i18next";

import { TButton } from "@/components/TButton";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";

import styles from "./exercises.styles";
import type { ExercisesProps } from "./exercises.types";
import { useExerciseSessionNative } from "./hooks/useExerciseSessionNative";

/**
 * Native exercises screen with MediaPipe pose detection
 * Uses @thinksys/react-native-mediapipe for iOS/Android
 */

export default function ExercisesNativeScreen(props: ExercisesProps) {
  const { t } = useTranslation();

  const {
    showCamera,
    cameraSessionKey,
    cameraWidth,
    cameraHeight,
    messageKey,
    feedback,
    handleLandmark,
    handleSwitchCamera,
    headerTitle,
    headerSubtitle,
    insets,
    scrimColor,
    overlayBorder,
    overlayHeading,
    overlayMuted,
    cardBackground,
    messageColor,
    accentColor,
    primaryChip,
    heroChips,
    routineProgress,
    nextExerciseTitle,
  } = useExerciseSessionNative(props);

  return (
    <ThemedView style={styles.screen} lightColor="#000" darkColor="#000">
      <ThemedView style={styles.cameraWrapper} pointerEvents="none">
        {showCamera ? (
          <RNMediapipe
            key={cameraSessionKey}
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
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            {routineProgress ? (
              <ThemedView
                style={[
                  styles.progressCard,
                  {
                    borderColor: overlayBorder,
                    backgroundColor: cardBackground,
                  },
                ]}
                lightColor="transparent"
                darkColor="transparent"
                pointerEvents="none"
              >
                <ThemedView
                  style={styles.progressHeader}
                  lightColor="transparent"
                  darkColor="transparent"
                >
                  <ThemedText
                    style={[styles.progressLabel, { color: overlayHeading }]}
                  >
                    {t("routineRun.progressLabel", {
                      current: routineProgress.completed,
                      target: routineProgress.target,
                    })}
                  </ThemedText>
                  <ThemedText
                    style={[styles.progressValue, { color: overlayHeading }]}
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
                    style={[styles.nextExercise, { color: overlayMuted }]}
                    numberOfLines={1}
                  >
                    {t("routineRun.nextExercise", {
                      exercise: nextExerciseTitle,
                    })}
                  </ThemedText>
                ) : null}
              </ThemedView>
            ) : null}
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

            <TButton
              variant="primary"
              onPress={handleSwitchCamera}
              accessibilityLabel={t("exercises.native.switchCamera.label")}
              accessibilityHint={t(
                "exercises.native.switchCamera.accessibilityHint",
              )}
              iconName="camera-reverse-outline"
              fullWidth
            >
              {t("exercises.native.switchCamera.label")}
            </TButton>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </ThemedView>
  );
}
