import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import type { ColorValue } from "react-native";
import { Card, H4, Progress, Text, XStack, YStack } from "tamagui";

import { TButton } from "@/components/TButton";
import { useColorScheme } from "@/hooks/useColorScheme";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";

import type { NextAction } from "@/app/home/hooks/useHomeStats";

interface TNextActionCardProps {
  nextAction: NextAction;
}

export const TNextActionCard: React.FC<TNextActionCardProps> = ({
  nextAction,
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const activeSession = useRoutineSessionStore((state) => state.activeSession);
  const restartFromSession = useRoutineSessionStore(
    (state) => state.restartFromSession,
  );
  const resetActive = useRoutineSessionStore((state) => state.resetActive);

  const handlePress = () => {
    if (nextAction.type === "continue-routine") {
      // If there's an active session, resume it
      if (activeSession && (activeSession.plan?.length ?? 0) > 0) {
        const currentStep = activeSession.plan[activeSession.currentStepIndex];
        if (currentStep) {
          router.push({
            pathname: "/exercises/[exerciseId]",
            params: {
              exerciseId: currentStep.exerciseId,
              routineId: activeSession.id,
              stepIndex: activeSession.currentStepIndex.toString(),
            },
          });
          return;
        }
      }

      // If there's a routineId but no active session, restart it
      if (nextAction.routineId) {
        const newSessionId = restartFromSession(nextAction.routineId);
        if (newSessionId) {
          // Get the first exercise of the restarted routine
          const newActiveSession =
            useRoutineSessionStore.getState().activeSession;
          if (newActiveSession && (newActiveSession.plan?.length ?? 0) > 0) {
            const firstStep = newActiveSession.plan[0];
            router.push({
              pathname: "/exercises/[exerciseId]",
              params: {
                exerciseId: firstStep.exerciseId,
                routineId: newSessionId,
                stepIndex: "0",
              },
            });
            return;
          }
        }
      }

      // Otherwise, go to routine builder to set up and start
      router.push("/routine");
    } else if (nextAction.type === "suggested-exercise") {
      // Navigate directly to exercise if we have the exerciseId
      if (nextAction.exerciseId) {
        router.push(`/exerciseSession?exerciseId=${nextAction.exerciseId}`);
      } else {
        router.push("/exercises");
      }
    } else {
      router.push("/routine");
    }
  };

  const handleEdit = () => {
    if (nextAction.type === "continue-routine" || nextAction.type === "none") {
      router.push("/routine");
    } else if (nextAction.type === "suggested-exercise") {
      router.push("/exercises");
    }
  };

  const handleCancel = () => {
    resetActive();
  };

  const getIcon = () => {
    if (nextAction.type === "continue-routine") return "play-circle";
    if (nextAction.type === "suggested-exercise") return "barbell";
    return "add-circle";
  };

  const getGradientColors = (): {
    bg: ColorValue;
    border: ColorValue;
    accent: ColorValue;
    accentHover: ColorValue;
  } => {
    if (nextAction.type === "continue-routine")
      return {
        bg: isDark ? "#1e3a8a" : "#dbeafe",
        border: isDark ? "#3b82f6" : "#93c5fd",
        accent: "#2563eb",
        accentHover: "#1d4ed8",
      };
    if (nextAction.type === "suggested-exercise")
      return {
        bg: isDark ? "#581c87" : "#e9d5ff",
        border: isDark ? "#a855f7" : "#c084fc",
        accent: "#9333ea",
        accentHover: "#7e22ce",
      };
    return {
      bg: isDark ? "#065f46" : "#d1fae5",
      border: isDark ? "#10b981" : "#6ee7b7",
      accent: "#059669",
      accentHover: "#047857",
    };
  };

  const colors = getGradientColors();

  return (
    <Card
      size="$4"
      bordered
      backgroundColor={colors.bg as any}
      borderColor={colors.border as any}
      padding="$5"
      pressStyle={{ scale: 0.98 }}
      animation="quick"
    >
      <YStack gap="$4">
        <XStack gap="$3" alignItems="center">
          <YStack
            width={48}
            height={48}
            alignItems="center"
            justifyContent="center"
            backgroundColor={colors.accent as any}
            borderRadius="$6"
          >
            <Ionicons name={getIcon()} size={24} color="white" />
          </YStack>

          <YStack flex={1} gap="$1">
            <Text fontSize="$3" color={colors.accent as any} fontWeight="700">
              {nextAction.type === "continue-routine"
                ? t("home.nextAction.continue")
                : nextAction.type === "suggested-exercise"
                  ? t("home.nextAction.suggested")
                  : t("home.nextAction.start")}
            </Text>
            <H4 color="$color" fontWeight="700">
              {nextAction.title}
            </H4>
            <Text fontSize="$4" color="$color" opacity={0.8}>
              {nextAction.subtitle}
            </Text>
          </YStack>
        </XStack>

        {nextAction.progress !== undefined && nextAction.progress > 0 && (
          <YStack gap="$2">
            <Progress value={nextAction.progress} max={100}>
              <Progress.Indicator
                animation="quick"
                backgroundColor={colors.accent as any}
              />
            </Progress>
            <Text
              fontSize="$2"
              color="$color"
              opacity={0.7}
              fontWeight="600"
              textAlign="right"
            >
              {Math.round(nextAction.progress)}% {t("home.nextAction.complete")}
            </Text>
          </YStack>
        )}

        <XStack gap="$3">
          {/* Edit button - only show when there's a routine to edit (active or last completed) */}
          {(nextAction.type === "continue-routine" ||
            nextAction.type === "suggested-exercise") && (
            <TButton
              flex={1}
              size="$4"
              variant="outline"
              onPress={handleEdit}
              iconName="create-outline"
            >
              {t("home.nextAction.editButton")}
            </TButton>
          )}

          {/* Cancel button - only for active sessions */}
          {nextAction.isActiveSession && (
            <TButton
              flex={1}
              size="$4"
              variant="destructive"
              onPress={handleCancel}
              iconName="close-circle-outline"
            >
              {t("home.nextAction.cancelButton")}
            </TButton>
          )}

          {/* For first-time users: show both Create Routine and Try Exercise */}
          {nextAction.type === "none" ? (
            <>
              <TButton
                flex={1}
                size="$4"
                variant="outline"
                onPress={() => router.push("/exercises")}
                iconName="barbell-outline"
              >
                {t("home.nextAction.tryExerciseButton")}
              </TButton>
              <TButton
                flex={1}
                size="$4"
                variant="primary"
                onPress={handlePress}
                iconAfterName="arrow-forward"
              >
                {t("home.nextAction.createRoutineButton")}
              </TButton>
            </>
          ) : (
            /* Main action button for other cases */
            <TButton
              flex={1}
              size="$4"
              variant="primary"
              onPress={handlePress}
              iconAfterName="arrow-forward"
            >
              {nextAction.type === "continue-routine"
                ? t("home.nextAction.resumeButton")
                : t("home.nextAction.beginButton")}
            </TButton>
          )}
        </XStack>
      </YStack>
    </Card>
  );
};
