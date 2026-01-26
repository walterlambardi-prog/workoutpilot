import React from "react";
import { Card, Image, XStack, YStack, useMedia } from "tamagui";

import { TText } from "@/components/TText";
import styles from "./ExerciseCard.styles";
import type { ExerciseCardProps } from "./ExerciseCard.types";

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  image,
  accessibilityHint,
  onPress,
}) => {
  const media = useMedia();
  const thumbnailStyle = media.gtSm
    ? [styles.thumbnail, styles.thumbnailLarge]
    : styles.thumbnail;
  const paddingSize = media.gtSm ? "$5" : "$4";
  const headingSize = media.gtSm ? "$5" : "$6";
  const bodySize = media.gtSm ? "$4" : "$5";

  return (
    <Card
      size="$4"
      bordered
      animation="bouncy"
      scale={0.98}
      hoverStyle={{ scale: 1 }}
      pressStyle={{ scale: 0.96 }}
      onPress={onPress}
      backgroundColor="$background"
      borderColor="$borderColor"
      padding={paddingSize}
      cursor="pointer"
    >
      <XStack space="$3" alignItems="center">
        <Image source={image} style={thumbnailStyle} resizeMode="cover" />

        <YStack flex={1} minWidth={0} space="$1">
          <TText fontSize={headingSize} fontWeight="800" numberOfLines={1}>
            {title}
          </TText>
          <TText
            variant="body"
            fontSize={bodySize}
            opacity={0.85}
            numberOfLines={2}
          >
            {description}
          </TText>
        </YStack>
      </XStack>
    </Card>
  );
};

export default ExerciseCard;
