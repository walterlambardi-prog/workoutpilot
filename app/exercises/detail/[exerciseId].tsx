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
    useMedia,
    useTheme,
} from "tamagui";

import { EXERCISE_DEFINITIONS } from "@/app/exercises/exercises.data";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TPage } from "@/components/TPage";
import { ExerciseId } from "@/constants/exercises";
import { BACKGROUND_IMAGES } from "@/constants/images";
import { Spacing } from "@/constants/theme";

const ExerciseDetailScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const media = useMedia();
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

          {/* Responsive Layout: Horizontal on web, vertical on mobile */}
          <XStack
            gap="$6"
            flexDirection={media.gtSm ? "row" : "column"}
            alignItems="flex-start"
          >
            {/* Image Section */}
            <Card
              bordered
              elevate={false}
              padding={0}
              overflow="hidden"
              backgroundColor="$backgroundHover"
              width={media.gtSm ? "45%" : "100%"}
              flexShrink={0}
            >
              <Image
                source={
                  exerciseId === ExerciseId.STEP_TRACKER
                    ? BACKGROUND_IMAGES.park
                    : BACKGROUND_IMAGES.home
                }
                style={{ position: "absolute", width: "100%", height: "100%" }}
              />
              <Image
                source={exercise.image}
                style={{
                  width: "100%",
                  height: media.gtSm ? 500 : 400,
                }}
                resizeMode="contain"
                accessibilityLabel={t(`${exercise.copyKey}.title`)}
              />
            </Card>

            {/* Content Section */}
            <YStack gap="$5" flex={1}>
              {/* Description Section */}
              <YStack gap="$3">
                <Text fontSize="$6" fontWeight="700" color="$color">
                  {t("exercises.detail.description.title")}
                </Text>
                <Text
                  fontSize="$4"
                  color="$color"
                  opacity={0.9}
                  lineHeight="$6"
                >
                  {t(`${exercise.copyKey}.description`)}
                </Text>
              </YStack>

              <Separator borderColor="$borderColor" opacity={0.5} />

              {/* Benefits Section */}
              <YStack gap="$4">
                <Text fontSize="$6" fontWeight="700" color="$color">
                  {t("exercises.detail.benefits.title")}
                </Text>
                <YStack gap="$3">
                  {(
                    t(`${exercise.copyKey}.benefits`, {
                      returnObjects: true,
                      defaultValue: [],
                    }) as string[]
                  ).map((benefit: string, index: number) => (
                    <XStack key={index} gap="$3" alignItems="center">
                      <YStack
                        width={20}
                        height={20}
                        backgroundColor="$success"
                        borderRadius={10}
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Ionicons name="checkmark" size={14} color="#fff" />
                      </YStack>
                      <Text
                        fontSize="$4"
                        color="$color"
                        opacity={0.9}
                        flex={1}
                        lineHeight="$5"
                      >
                        {benefit}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </YStack>

              <Separator borderColor="$borderColor" opacity={0.5} />

              {/* Instructions Section */}
              <YStack gap="$4">
                <Text fontSize="$6" fontWeight="700" color="$color">
                  {t("exercises.detail.instructions.title")}
                </Text>
                <YStack gap="$3">
                  {(
                    t(`${exercise.copyKey}.instructions`, {
                      returnObjects: true,
                      defaultValue: [],
                    }) as string[]
                  ).map((instruction: string, index: number) => (
                    <XStack key={index} gap="$3" alignItems="center">
                      <YStack
                        width={24}
                        height={24}
                        backgroundColor="$primary"
                        borderRadius={12}
                        alignItems="center"
                        justifyContent="center"
                        flexShrink={0}
                      >
                        <Text fontSize="$3" fontWeight="700" color="$onPrimary">
                          {index + 1}
                        </Text>
                      </YStack>
                      <Text
                        fontSize="$4"
                        color="$color"
                        opacity={0.9}
                        flex={1}
                        lineHeight="$5"
                      >
                        {instruction}
                      </Text>
                    </XStack>
                  ))}
                </YStack>
              </YStack>
            </YStack>
          </XStack>

          {/* Action Buttons - Horizontal Row */}
          <XStack gap="$3" paddingBottom="$6">
            <TButton
              flex={1}
              size="$5"
              onPress={handleStartExercise}
              iconAfterName="play-circle"
            >
              {t("exercises.detail.startButton")}
            </TButton>

            <TButton
              flex={1}
              size="$5"
              variant="outline"
              onPress={() => router.back()}
              iconName="arrow-back"
            >
              {t("common.back")}
            </TButton>
          </XStack>
        </YStack>
      </TPage>
    </>
  );
};

export default ExerciseDetailScreen;
