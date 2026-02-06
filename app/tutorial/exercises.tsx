import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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

import { TButton } from "@/components/TButton";
import { TPage } from "@/components/TPage";
import { EXERCISE_IMAGES, TUTORIAL_IMAGES } from "@/constants/images";
import { Spacing } from "@/constants/theme";

const ExercisesTutorialScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const media = useMedia();

  const guidelines = [
    {
      icon: "eye-outline" as const,
      titleKey: "tutorial.exercises.guidelines.visibility.title",
      descriptionKey: "tutorial.exercises.guidelines.visibility.description",
    },
    {
      icon: "time-outline" as const,
      titleKey: "tutorial.exercises.guidelines.tempo.title",
      descriptionKey: "tutorial.exercises.guidelines.tempo.description",
    },
    {
      icon: "fitness-outline" as const,
      titleKey: "tutorial.exercises.guidelines.form.title",
      descriptionKey: "tutorial.exercises.guidelines.form.description",
    },
    {
      icon: "pause-outline" as const,
      titleKey: "tutorial.exercises.guidelines.pauses.title",
      descriptionKey: "tutorial.exercises.guidelines.pauses.description",
    },
  ];

  const titleSize = media.gtSm ? "$7" : "$6";
  const bodySize = media.gtSm ? "$5" : "$4";

  return (
    <TPage hasHeader scrollable backgroundColor="$background">
      <YStack gap={Spacing.xxl}>
        {/* Title and Introduction */}
        <YStack gap="$4">
          <Text
            fontSize="$9"
            fontWeight="800"
            color="$color"
            letterSpacing={-0.5}
          >
            {t("tutorial.exercises.title")}
          </Text>
          <Text
            fontSize={bodySize}
            color="$color"
            opacity={0.9}
            lineHeight="$7"
          >
            {t("tutorial.exercises.intro")}
          </Text>
        </YStack>

        {/* Image and Rep Counting - Side by side on desktop */}
        {media.gtSm ? (
          <XStack gap="$4" alignItems="flex-start">
            {/* Header Image */}
            <Card
              flex={1}
              bordered
              elevate={false}
              padding={0}
              overflow="hidden"
              backgroundColor="$backgroundHover"
            >
              <Image
                source={TUTORIAL_IMAGES.exercisesTutorial}
                style={{
                  width: "100%",
                  height: 350,
                }}
                resizeMode="cover"
              />
            </Card>

            {/* Rep Counting Logic */}
            <YStack flex={1} gap="$4">
              <Text fontSize={titleSize} fontWeight="700" color="$color">
                {t("tutorial.exercises.repCounting.title")}
              </Text>
              <Text
                fontSize={bodySize}
                color="$color"
                opacity={0.9}
                lineHeight="$6"
              >
                {t("tutorial.exercises.repCounting.description")}
              </Text>

              <YStack gap="$3" paddingLeft="$4">
                {[1, 2, 3].map((step) => (
                  <XStack key={step} gap="$3" alignItems="center">
                    <YStack
                      width="$4"
                      height="$4"
                      backgroundColor="$success"
                      borderRadius="$2"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontSize="$3" fontWeight="700" color="$onPrimary">
                        {step}
                      </Text>
                    </YStack>
                    <Text
                      fontSize={bodySize}
                      color="$color"
                      opacity={0.9}
                      flex={1}
                      lineHeight="$6"
                    >
                      {t(`tutorial.exercises.repCounting.steps.${step}`)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </XStack>
        ) : (
          // Mobile: Stacked
          <YStack gap="$4">
            {/* Header Image */}
            <Card
              bordered
              elevate={false}
              padding={0}
              overflow="hidden"
              backgroundColor="$backgroundHover"
            >
              <Image
                source={TUTORIAL_IMAGES.exercisesTutorial}
                style={{
                  width: "100%",
                  height: 250,
                }}
                resizeMode="cover"
              />
            </Card>

            {/* Rep Counting Logic */}
            <YStack gap="$4">
              <Text fontSize={titleSize} fontWeight="700" color="$color">
                {t("tutorial.exercises.repCounting.title")}
              </Text>
              <Text
                fontSize={bodySize}
                color="$color"
                opacity={0.9}
                lineHeight="$6"
              >
                {t("tutorial.exercises.repCounting.description")}
              </Text>

              <YStack gap="$3" paddingLeft="$4">
                {[1, 2, 3].map((step) => (
                  <XStack key={step} gap="$3" alignItems="center">
                    <YStack
                      width="$4"
                      height="$4"
                      backgroundColor="$success"
                      borderRadius="$2"
                      alignItems="center"
                      justifyContent="center"
                      flexShrink={0}
                    >
                      <Text fontSize="$3" fontWeight="700" color="$onPrimary">
                        {step}
                      </Text>
                    </YStack>
                    <Text
                      fontSize={bodySize}
                      color="$color"
                      opacity={0.9}
                      flex={1}
                      lineHeight="$6"
                    >
                      {t(`tutorial.exercises.repCounting.steps.${step}`)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>
        )}

        <Separator borderColor="$borderColor" opacity={0.5} />

        {/* Privacy Notice */}
        <Card
          bordered
          elevate={false}
          padding="$4"
          backgroundColor="$backgroundHover"
        >
          <XStack gap="$3" alignItems="flex-start">
            <YStack
              width="$6"
              height="$6"
              backgroundColor="$success"
              borderRadius="$3"
              alignItems="center"
              justifyContent="center"
              flexShrink={0}
            >
              <Ionicons name="shield-checkmark" size={24} color="white" />
            </YStack>
            <YStack gap="$2" flex={1}>
              <Text fontSize="$5" fontWeight="700" color="$color">
                {t("tutorial.exercises.privacy.title")}
              </Text>
              <Text fontSize="$4" color="$color" opacity={0.85} lineHeight="$6">
                {t("tutorial.exercises.privacy.description")}
              </Text>
            </YStack>
          </XStack>
        </Card>

        <Separator borderColor="$borderColor" opacity={0.5} />

        {/* Exercise Guidelines */}
        <YStack gap="$4">
          <Text fontSize={titleSize} fontWeight="700" color="$color">
            {t("tutorial.exercises.guidelinesTitle")}
          </Text>

          <YStack gap="$4">
            {guidelines.map((guideline, index) => (
              <Card
                key={index}
                bordered
                elevate={false}
                padding="$4"
                backgroundColor="$backgroundHover"
              >
                <XStack gap="$3" alignItems="flex-start">
                  <YStack
                    width="$6"
                    height="$6"
                    backgroundColor="$success"
                    borderRadius="$3"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Ionicons name={guideline.icon} size={24} color="#fff" />
                  </YStack>
                  <YStack gap="$2" flex={1}>
                    <Text fontSize="$5" fontWeight="700" color="$color">
                      {t(guideline.titleKey)}
                    </Text>
                    <Text
                      fontSize={bodySize}
                      color="$color"
                      opacity={0.85}
                      lineHeight="$6"
                    >
                      {t(guideline.descriptionKey)}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            ))}
          </YStack>
        </YStack>

        <Separator borderColor="$borderColor" opacity={0.5} />

        {/* Exercise-Specific Tips */}
        <YStack gap="$4">
          <Text fontSize={titleSize} fontWeight="700" color="$color">
            {t("tutorial.exercises.specificTips.title")}
          </Text>

          <YStack gap="$3">
            {[
              "squats",
              "pushups",
              "lateralRaises",
              "alternatingKneeRaises",
              "hammerCurls",
              "calfRaises",
              "lunges",
              "standingChestFly",
              "standingLegRaises",
            ].map((exercise) => (
              <Card
                key={exercise}
                bordered
                elevate={false}
                padding="$4"
                backgroundColor="$backgroundHover"
              >
                {media.gtSm ? (
                  // Desktop: Image on left, content on right
                  <XStack gap="$4" alignItems="flex-start">
                    <Card
                      bordered
                      elevate={false}
                      padding={0}
                      overflow="hidden"
                      width={200}
                      flexShrink={0}
                    >
                      <Image
                        source={
                          EXERCISE_IMAGES[
                            exercise as keyof typeof EXERCISE_IMAGES
                          ]
                        }
                        style={{
                          width: "100%",
                          height: 150,
                        }}
                        resizeMode="cover"
                      />
                    </Card>
                    <YStack gap="$3" flex={1}>
                      <Text fontSize="$5" fontWeight="700" color="$primary">
                        {t(`tutorial.exercises.specificTips.${exercise}.title`)}
                      </Text>
                      <YStack gap="$2" paddingLeft="$3">
                        {[1, 2, 3].map((tip) => (
                          <XStack key={tip} gap="$2" alignItems="flex-start">
                            <Text
                              fontSize={bodySize}
                              color="$color"
                              opacity={0.6}
                            >
                              •
                            </Text>
                            <Text
                              fontSize={bodySize}
                              color="$color"
                              opacity={0.85}
                              flex={1}
                              lineHeight="$6"
                            >
                              {t(
                                `tutorial.exercises.specificTips.${exercise}.tips.${tip}`,
                              )}
                            </Text>
                          </XStack>
                        ))}
                      </YStack>
                    </YStack>
                  </XStack>
                ) : (
                  // Mobile: Stacked
                  <YStack gap="$3">
                    <Card
                      bordered
                      elevate={false}
                      padding={0}
                      overflow="hidden"
                    >
                      <Image
                        source={
                          EXERCISE_IMAGES[
                            exercise as keyof typeof EXERCISE_IMAGES
                          ]
                        }
                        style={{
                          width: "100%",
                          height: 180,
                        }}
                        resizeMode="cover"
                      />
                    </Card>
                    <Text fontSize="$5" fontWeight="700" color="$primary">
                      {t(`tutorial.exercises.specificTips.${exercise}.title`)}
                    </Text>
                    <YStack gap="$2" paddingLeft="$3">
                      {[1, 2, 3].map((tip) => (
                        <XStack key={tip} gap="$2" alignItems="flex-start">
                          <Text
                            fontSize={bodySize}
                            color="$color"
                            opacity={0.6}
                          >
                            •
                          </Text>
                          <Text
                            fontSize={bodySize}
                            color="$color"
                            opacity={0.85}
                            flex={1}
                            lineHeight="$6"
                          >
                            {t(
                              `tutorial.exercises.specificTips.${exercise}.tips.${tip}`,
                            )}
                          </Text>
                        </XStack>
                      ))}
                    </YStack>
                  </YStack>
                )}
              </Card>
            ))}
          </YStack>
        </YStack>

        {/* Action Buttons */}
        <XStack gap="$3" paddingBottom="$6">
          <TButton
            flex={1}
            size="$5"
            variant="outline"
            onPress={() => router.back()}
            iconName="arrow-back"
          >
            {t("common.back")}
          </TButton>
          <TButton
            flex={1}
            size="$5"
            onPress={() => router.push("/exercises")}
            iconAfterName="play-circle"
          >
            {t("tutorial.startPracticing")}
          </TButton>
        </XStack>
      </YStack>
    </TPage>
  );
};

export default ExercisesTutorialScreen;
