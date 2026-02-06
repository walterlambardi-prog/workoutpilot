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
import { TUTORIAL_IMAGES } from "@/constants/images";
import { Spacing } from "@/constants/theme";

const PoseDetectionTutorialScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const media = useMedia();

  const tips = [
    {
      icon: "resize-outline" as const,
      titleKey: "tutorial.mediapipe.tips.distance.title",
      descriptionKey: "tutorial.mediapipe.tips.distance.description",
    },
    {
      icon: "body-outline" as const,
      titleKey: "tutorial.mediapipe.tips.positioning.title",
      descriptionKey: "tutorial.mediapipe.tips.positioning.description",
    },
    {
      icon: "sunny-outline" as const,
      titleKey: "tutorial.mediapipe.tips.lighting.title",
      descriptionKey: "tutorial.mediapipe.tips.lighting.description",
    },
    {
      icon: "shirt-outline" as const,
      titleKey: "tutorial.mediapipe.tips.clothing.title",
      descriptionKey: "tutorial.mediapipe.tips.clothing.description",
    },
    {
      icon: "images-outline" as const,
      titleKey: "tutorial.mediapipe.tips.background.title",
      descriptionKey: "tutorial.mediapipe.tips.background.description",
    },
    {
      icon: "infinite-outline" as const,
      titleKey: "tutorial.mediapipe.tips.movement.title",
      descriptionKey: "tutorial.mediapipe.tips.movement.description",
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
            {t("tutorial.mediapipe.title")}
          </Text>
          <Text
            fontSize={bodySize}
            color="$color"
            opacity={0.9}
            lineHeight="$7"
          >
            {t("tutorial.mediapipe.intro")}
          </Text>
        </YStack>

        {/* Image and How it Works - Side by side on desktop */}
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
                source={TUTORIAL_IMAGES.mediapipe}
                style={{
                  width: "100%",
                  height: 360,
                }}
                resizeMode="cover"
              />
            </Card>

            {/* How it Works */}
            <YStack flex={1} gap="$4">
              <Text fontSize={titleSize} fontWeight="700" color="$color">
                {t("tutorial.mediapipe.howItWorks.title")}
              </Text>

              <Text
                fontSize={bodySize}
                color="$color"
                opacity={0.9}
                lineHeight="$6"
              >
                {t("tutorial.mediapipe.howItWorks.description")}
              </Text>

              <YStack gap="$3" paddingLeft="$4">
                {[1, 2, 3, 4].map((step) => (
                  <XStack key={step} gap="$3" alignItems="flex-start">
                    <YStack
                      width="$4"
                      height="$4"
                      backgroundColor="$primary"
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
                      {t(`tutorial.mediapipe.howItWorks.steps.${step}`)}
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
                source={TUTORIAL_IMAGES.mediapipe}
                style={{
                  width: "100%",
                  height: 280,
                }}
                resizeMode="cover"
              />
            </Card>

            {/* How it Works */}
            <YStack gap="$4">
              <Text fontSize={titleSize} fontWeight="700" color="$color">
                {t("tutorial.mediapipe.howItWorks.title")}
              </Text>

              <Text
                fontSize={bodySize}
                color="$color"
                opacity={0.9}
                lineHeight="$6"
              >
                {t("tutorial.mediapipe.howItWorks.description")}
              </Text>

              <YStack gap="$3" paddingLeft="$4">
                {[1, 2, 3, 4].map((step) => (
                  <XStack key={step} gap="$3" alignItems="flex-start">
                    <YStack
                      width="$4"
                      height="$4"
                      backgroundColor="$primary"
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
                      {t(`tutorial.mediapipe.howItWorks.steps.${step}`)}
                    </Text>
                  </XStack>
                ))}
              </YStack>
            </YStack>
          </YStack>
        )}

        <Separator borderColor="$borderColor" opacity={0.5} />

        {/* Positioning Section */}
        <YStack gap="$4">
          <YStack gap="$2">
            <Text fontSize={titleSize} fontWeight="700" color="$color">
              {t("tutorial.mediapipe.positioning.title")}
            </Text>
            <Text
              fontSize={bodySize}
              color="$color"
              opacity={0.8}
              lineHeight="$6"
            >
              {t("tutorial.mediapipe.positioning.subtitle")}
            </Text>
          </YStack>

          {media.gtSm ? (
            // Desktop: Side by side
            <XStack gap="$4">
              {/* Mobile Positioning */}
              <Card
                flex={1}
                bordered
                elevate={false}
                padding={0}
                overflow="hidden"
                backgroundColor="$backgroundHover"
              >
                <Image
                  source={TUTORIAL_IMAGES.manHomeMobile}
                  style={{
                    width: "100%",
                    height: 380,
                  }}
                  resizeMode="cover"
                />
                <YStack padding="$4" gap="$2">
                  <XStack gap="$2" alignItems="center">
                    <Ionicons
                      name="phone-portrait-outline"
                      size={20}
                      color={theme.primary?.get() as string}
                    />
                    <Text fontSize="$5" fontWeight="700" color="$color">
                      {t("tutorial.mediapipe.positioning.mobile.title")}
                    </Text>
                  </XStack>
                  <Text
                    fontSize="$4"
                    color="$color"
                    opacity={0.85}
                    lineHeight="$5"
                  >
                    {t("tutorial.mediapipe.positioning.mobile.description")}
                  </Text>
                </YStack>
              </Card>

              {/* Laptop/Webcam Positioning */}
              <Card
                flex={1}
                bordered
                elevate={false}
                padding={0}
                overflow="hidden"
                backgroundColor="$backgroundHover"
              >
                <Image
                  source={TUTORIAL_IMAGES.womanHomeWebcam}
                  style={{
                    width: "100%",
                    height: 380,
                  }}
                  resizeMode="cover"
                />
                <YStack padding="$4" gap="$2">
                  <XStack gap="$2" alignItems="center">
                    <Ionicons
                      name="laptop-outline"
                      size={20}
                      color={theme.primary?.get() as string}
                    />
                    <Text fontSize="$5" fontWeight="700" color="$color">
                      {t("tutorial.mediapipe.positioning.laptop.title")}
                    </Text>
                  </XStack>
                  <Text
                    fontSize="$4"
                    color="$color"
                    opacity={0.85}
                    lineHeight="$5"
                  >
                    {t("tutorial.mediapipe.positioning.laptop.description")}
                  </Text>
                </YStack>
              </Card>
            </XStack>
          ) : (
            // Mobile: Stacked
            <YStack gap="$4">
              {/* Mobile Positioning */}
              <Card
                bordered
                elevate={false}
                padding={0}
                overflow="hidden"
                backgroundColor="$backgroundHover"
              >
                <Image
                  source={TUTORIAL_IMAGES.manHomeMobile}
                  style={{
                    width: "100%",
                    height: 380,
                  }}
                  resizeMode="cover"
                />
                <YStack padding="$4" gap="$2">
                  <XStack gap="$2" alignItems="center">
                    <Ionicons
                      name="phone-portrait-outline"
                      size={20}
                      color={theme.primary?.get() as string}
                    />
                    <Text fontSize="$5" fontWeight="700" color="$color">
                      {t("tutorial.mediapipe.positioning.mobile.title")}
                    </Text>
                  </XStack>
                  <Text
                    fontSize="$4"
                    color="$color"
                    opacity={0.85}
                    lineHeight="$5"
                  >
                    {t("tutorial.mediapipe.positioning.mobile.description")}
                  </Text>
                </YStack>
              </Card>

              {/* Laptop/Webcam Positioning */}
              <Card
                bordered
                elevate={false}
                padding={0}
                overflow="hidden"
                backgroundColor="$backgroundHover"
              >
                <Image
                  source={TUTORIAL_IMAGES.womanHomeWebcam}
                  style={{
                    width: "100%",
                    height: 320,
                  }}
                  resizeMode="cover"
                />
                <YStack padding="$4" gap="$2">
                  <XStack gap="$2" alignItems="center">
                    <Ionicons
                      name="laptop-outline"
                      size={20}
                      color={theme.primary?.get() as string}
                    />
                    <Text fontSize="$5" fontWeight="700" color="$color">
                      {t("tutorial.mediapipe.positioning.laptop.title")}
                    </Text>
                  </XStack>
                  <Text
                    fontSize="$4"
                    color="$color"
                    opacity={0.85}
                    lineHeight="$5"
                  >
                    {t("tutorial.mediapipe.positioning.laptop.description")}
                  </Text>
                </YStack>
              </Card>
            </YStack>
          )}
        </YStack>

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
                {t("tutorial.mediapipe.privacy.title")}
              </Text>
              <Text
                fontSize={bodySize}
                color="$color"
                opacity={0.85}
                lineHeight="$6"
              >
                {t("tutorial.mediapipe.privacy.description")}
              </Text>
            </YStack>
          </XStack>
        </Card>

        <Separator borderColor="$borderColor" opacity={0.5} />

        {/* Best Practices */}
        <YStack gap="$4">
          <Text fontSize={titleSize} fontWeight="700" color="$color">
            {t("tutorial.mediapipe.bestPractices")}
          </Text>

          <YStack gap="$4">
            {tips.map((tip, index) => (
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
                    backgroundColor="$primary"
                    borderRadius="$3"
                    alignItems="center"
                    justifyContent="center"
                    flexShrink={0}
                  >
                    <Ionicons
                      name={tip.icon}
                      size={24}
                      color={theme.onPrimary?.get() as string}
                    />
                  </YStack>
                  <YStack gap="$2" flex={1}>
                    <Text fontSize="$5" fontWeight="700" color="$color">
                      {t(tip.titleKey)}
                    </Text>
                    <Text
                      fontSize={bodySize}
                      color="$color"
                      opacity={0.85}
                      lineHeight="$6"
                    >
                      {t(tip.descriptionKey)}
                    </Text>
                  </YStack>
                </XStack>
              </Card>
            ))}
          </YStack>
        </YStack>

        <Separator borderColor="$borderColor" opacity={0.5} />

        {/* Common Issues */}
        <YStack gap="$4">
          <Text fontSize={titleSize} fontWeight="700" color="$color">
            {t("tutorial.mediapipe.commonIssues.title")}
          </Text>

          <YStack gap="$3">
            {[1, 2, 3, 4].map((issue) => (
              <Card
                key={issue}
                bordered
                elevate={false}
                padding="$4"
                backgroundColor="$backgroundHover"
              >
                <YStack gap="$3">
                  <XStack gap="$3" alignItems="center">
                    <Text fontSize="$5" fontWeight="700" color="$color">
                      {t(
                        `tutorial.mediapipe.commonIssues.issues.${issue}.problem`,
                      )}
                    </Text>
                  </XStack>
                  <XStack gap="$2" alignItems="flex-start" paddingLeft="$2">
                    <Ionicons
                      name="arrow-redo-outline"
                      size={24}
                      color={theme.warning?.get() as string}
                    />
                    <Text
                      fontSize={bodySize}
                      color="$color"
                      opacity={0.85}
                      flex={1}
                      lineHeight="$6"
                    >
                      {t(
                        `tutorial.mediapipe.commonIssues.issues.${issue}.solution`,
                      )}
                    </Text>
                  </XStack>
                </YStack>
              </Card>
            ))}

            {/* Camera Permissions Issue - Enhanced UI */}
            <Card
              bordered
              elevate={false}
              padding="$4"
              backgroundColor="$backgroundHover"
            >
              <YStack gap="$5">
                {/* Problem Header */}
                <XStack gap="$2" alignItems="center">
                  <Text fontSize="$5" fontWeight="700" color="$color">
                    {t("tutorial.mediapipe.commonIssues.issues.5.problem")}
                  </Text>
                </XStack>

                {/* Solutions */}
                <YStack gap="$3">
                  {/* Mobile Solution */}
                  <YStack
                    gap="$2"
                    padding="$3"
                    backgroundColor="$background"
                    borderRadius="$3"
                  >
                    <XStack gap="$2" alignItems="center">
                      <Ionicons
                        name="phone-portrait"
                        size={18}
                        color={theme.primary?.get() as string}
                      />
                      <Text fontSize="$5" fontWeight="600" color="$color">
                        {t(
                          "tutorial.mediapipe.commonIssues.issues.5.mobileTitle",
                        )}
                      </Text>
                    </XStack>
                    <Text
                      fontSize="$4"
                      color="$color"
                      opacity={0.85}
                      lineHeight="$5"
                    >
                      {t(
                        "tutorial.mediapipe.commonIssues.issues.5.mobileSolution",
                      )}
                    </Text>
                  </YStack>

                  {/* Web Solution */}
                  <YStack
                    gap="$2"
                    padding="$3"
                    backgroundColor="$background"
                    borderRadius="$3"
                  >
                    <XStack gap="$2" alignItems="center">
                      <Ionicons
                        name="globe-outline"
                        size={18}
                        color={theme.info?.get() as string}
                      />
                      <Text fontSize="$5" fontWeight="600" color="$color">
                        {t("tutorial.mediapipe.commonIssues.issues.5.webTitle")}
                      </Text>
                    </XStack>
                    <Text
                      fontSize="$4"
                      color="$color"
                      opacity={0.85}
                      lineHeight="$5"
                    >
                      {t(
                        "tutorial.mediapipe.commonIssues.issues.5.webSolution",
                      )}
                    </Text>
                  </YStack>
                </YStack>
              </YStack>
            </Card>
          </YStack>
        </YStack>

        {/* Action Button */}
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

export default PoseDetectionTutorialScreen;
