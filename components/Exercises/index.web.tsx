import React from "react";
import { useTranslation } from "react-i18next";
import { Button, Card, Separator, Text, Theme, XStack, YStack } from "tamagui";

import { TButton } from "@/components/TButton";

import type { ExercisesProps } from "./exercises.types";
import { webMediaStyles } from "./exercises.web.styles";
import { useExerciseSessionWeb } from "./hooks/useExerciseSessionWeb";

/**
 * Web exercises screen with MediaPipe pose detection
 * Uses @mediapipe/tasks-vision for browser-based pose detection
 */
export default function ExercisesWebScreen(props: ExercisesProps) {
  const { t } = useTranslation();

  const {
    status,
    messageKey,
    stats,
    videoRef,
    canvasRef,
    isCameraRunning,
    startCamera,
    stopCamera,
    headerTitle,
    headerSubtitle,
    primaryChip,
    heroChips,
    progress,
    routineIsActive,
    hasNextExercise,
    handleSkipExercise,
    handleFinishRoutine,
    media,
    heroTitleSize,
    heroSubtitleSize,
    overlayPadding,
    topRightPadding,
  } = useExerciseSessionWeb(props);

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

              {hasNextExercise && (
                <TButton
                  variant="outline"
                  onPress={handleSkipExercise}
                  iconAfterName="arrow-forward"
                  fullWidth
                >
                  {t("routineRun.skipToNext")}
                </TButton>
              )}

              <TButton
                variant="destructive"
                onPress={handleFinishRoutine}
                iconName="checkmark-done"
                fullWidth
              >
                {t("routineRun.finishRoutine")}
              </TButton>
            </YStack>
          )}
        </YStack>
      </YStack>
    </Theme>
  );
}
