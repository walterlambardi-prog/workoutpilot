import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { useTranslation } from "react-i18next";
import { ImageBackground, StyleSheet } from "react-native";
import { Card, useMedia, XStack, YStack } from "tamagui";

import { TButton } from "@/components/TButton";
import { TText } from "@/components/TText";
import type { ExerciseCardProps } from "./ExerciseCard.types";

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  image,
  onViewDetails,
  onStart,
}) => {
  const { t } = useTranslation();
  const media = useMedia();
  const paddingSize = media.gtSm ? "$5" : "$4";
  const headingSize = media.gtSm ? "$7" : "$6";
  const bodySize = media.gtSm ? "$4" : "$3";
  const cardHeight = media.gtSm ? 380 : 340;

  return (
    <Card
      size="$4"
      bordered
      borderColor="$borderColor"
      overflow="hidden"
      elevation="$3"
      hoverStyle={{
        elevation: "$5",
        scale: 1.02,
        borderColor: "$primary",
      }}
      animation="quick"
      pressStyle={{
        scale: 0.98,
      }}
      height={cardHeight}
    >
      {/* Background Image */}
      <ImageBackground
        source={image}
        style={styles.backgroundImage}
        resizeMode="contain"
        imageStyle={styles.imageStyle}
      >
        {/* Dark Gradient Overlay - More prominent for better text visibility */}
        <LinearGradient
          colors={["rgba(0,0,0,0.85)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.85)"]}
          style={styles.gradient}
          pointerEvents="none"
        />

        {/* Title and Description - Top */}
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          padding={paddingSize}
          gap="$2"
          zIndex={5}
          pointerEvents="box-none"
        >
          {/* Title */}
          <TText
            fontSize={headingSize}
            fontWeight="800"
            numberOfLines={2}
            color="white"
            style={{
              textShadowColor: "rgba(0,0,0,0.8)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 4,
            }}
          >
            {title}
          </TText>

          {/* Description */}
          <TText
            fontSize={bodySize}
            numberOfLines={2}
            color="rgba(255,255,255,0.95)"
            lineHeight="$1"
            style={{
              textShadowColor: "rgba(0,0,0,0.6)",
              textShadowOffset: { width: 0, height: 1 },
              textShadowRadius: 3,
            }}
          >
            {description}
          </TText>
        </YStack>

        {/* Action Buttons - Bottom */}
        <YStack
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          padding={paddingSize}
          zIndex={5}
          pointerEvents="box-none"
        >
          {media.gtSm ? (
            <XStack gap="$2" pointerEvents="auto">
              <TButton
                flex={1}
                size="$3"
                variant="secondary"
                onPress={onViewDetails}
                iconName="information-circle-outline"
              >
                {t("common.details")}
              </TButton>

              <TButton
                flex={1}
                size="$3"
                variant="primary"
                onPress={onStart}
                iconAfterName="play"
              >
                {t("common.start")}
              </TButton>
            </XStack>
          ) : (
            <XStack gap="$2" pointerEvents="auto">
              <TButton
                flex={1}
                size="$3"
                variant="secondary"
                onPress={onViewDetails}
                iconName="information-circle-outline"
              >
                {t("exercises.detail.viewDetailsButton")}
              </TButton>

              <TButton
                flex={1}
                size="$3"
                variant="primary"
                onPress={onStart}
                iconAfterName="play"
              >
                {t("exercises.detail.startButton")}
              </TButton>
            </XStack>
          )}
        </YStack>
      </ImageBackground>
    </Card>
  );
};

const styles = StyleSheet.create({
  backgroundImage: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imageStyle: {
    borderRadius: 12,
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
});

export default ExerciseCard;
