import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import {
    Card,
    Image,
    Separator,
    Text,
    XStack,
    YStack,
    useTheme,
} from "tamagui";

import { EXERCISE_DEFINITIONS } from "@/app/exercises/exercises.data";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TPage } from "@/components/TPage";
import { ExerciseId } from "@/constants/exercises";
import { Spacing } from "@/constants/theme";

const ExerciseDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { exerciseId } = useLocalSearchParams<{ exerciseId: string }>();

  const exercise = EXERCISE_DEFINITIONS.find((ex) => ex.id === exerciseId);

  if (!exercise) {
    return (
      <>
        <Stack.Screen options={{ title: t("exercises.detail.notFound") }} />
        <TPage hasHeader>
          <YStack gap="$4" alignItems="center" justifyContent="center" flex={1}>
            <Ionicons
              name="alert-circle-outline"
              size={64}
              color={theme.error?.get() as string}
            />
            <Text fontSize="$6" color="$color">
              {t("exercises.detail.notFound")}
            </Text>
            <TButton variant="outline" onPress={() => router.back()}>
              {t("common.back")}
            </TButton>
          </YStack>
        </TPage>
      </>
    );
  }

  const handleStartExercise = () => {
    if (exerciseId === ExerciseId.STEP_TRACKER) {
      router.push("/exercises/stepTracker");
    } else {
      router.push(`/exercises/${exerciseId}`);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t(`${exercise.copyKey}.title`),
        }}
      />
      <TPage hasHeader scrollable backgroundColor="$background">
        <YStack gap={Spacing.xxl}>
          <ScreenHeader
            title={t(`${exercise.copyKey}.title`)}
            subtitle={t("exercises.detail.subtitle")}
          />

          <Card
            bordered
            elevate={false}
            padding={0}
            overflow="hidden"
            backgroundColor="$backgroundHover"
          >
            <Image
              source={exercise.image}
              style={{
                width: "100%",
                height: 400,
              }}
              resizeMode="contain"
              accessibilityLabel={t(`${exercise.copyKey}.title`)}
            />
          </Card>

          <YStack gap="$4">
            <YStack gap="$2">
              <Text fontSize="$7" fontWeight="700" color="$color">
                {t("exercises.detail.description.title")}
              </Text>
              <Text fontSize="$5" color="$color" opacity={0.8} lineHeight="$6">
                {t(`${exercise.copyKey}.description`)}
              </Text>
            </YStack>

            <Separator />

            <YStack gap="$2">
              <Text fontSize="$7" fontWeight="700" color="$color">
                {t("exercises.detail.benefits.title")}
              </Text>
              <YStack gap="$3">
                {(
                  t(`${exercise.copyKey}.benefits`, {
                    returnObjects: true,
                    defaultValue: [],
                  }) as string[]
                ).map((benefit: string, index: number) => (
                  <XStack key={index} gap="$3" alignItems="flex-start">
                    <Ionicons
                      name="checkmark-circle"
                      size={24}
                      color={theme.success?.get() as string}
                    />
                    <Text fontSize="$5" color="$color" opacity={0.8} flex={1}>
                      {benefit}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>

            <Separator />

            <YStack gap="$2">
              <Text fontSize="$7" fontWeight="700" color="$color">
                {t("exercises.detail.instructions.title")}
              </Text>
              <YStack gap="$3">
                {(
                  t(`${exercise.copyKey}.instructions`, {
                    returnObjects: true,
                    defaultValue: [],
                  }) as string[]
                ).map((instruction: string, index: number) => (
                  <XStack key={index} gap="$3" alignItems="flex-start">
                    <YStack
                      width={28}
                      height={28}
                      backgroundColor="$primary"
                      borderRadius={14}
                      alignItems="center"
                      justifyContent="center"
                    >
                      <Text fontSize="$4" fontWeight="700" color="$onPrimary">
                        {index + 1}
                      </Text>
                    </YStack>
                    <Text fontSize="$5" color="$color" opacity={0.8} flex={1}>
                      {instruction}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>

          <YStack gap="$3" paddingBottom="$6">
            <TButton
              size="$5"
              onPress={handleStartExercise}
              iconAfterName="play-circle"
            >
              {t("exercises.detail.startButton")}
            </TButton>

            <TButton variant="outline" onPress={() => router.back()}>
              {t("common.back")}
            </TButton>
          </YStack>
        </YStack>
      </TPage>
    </>
  );
};

export default ExerciseDetailScreen;
