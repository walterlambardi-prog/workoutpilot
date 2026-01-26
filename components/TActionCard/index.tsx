import { TText } from "@/components/TText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Card, XStack, YStack, useMedia } from "tamagui";

export interface TActionCardProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  accessibilityHint?: string;
}

/**
 * Action Card component for navigation and quick actions
 * Built with Tamagui for consistent theming and animations
 *
 * @example
 * ```tsx
 * <TActionCard
 *   title="Start Workout"
 *   description="Begin your training routine"
 *   icon="barbell-outline"
 *   iconColor="#60A5FA"
 *   onPress={handlePress}
 * />
 * ```
 */
export const TActionCard: React.FC<TActionCardProps> = ({
  title,
  description,
  icon,
  iconColor,
  onPress,
  accessibilityHint,
}) => {
  const media = useMedia();
  const iconContainerSize = media.gtSm ? 80 : 64;
  const iconSize = media.gtSm ? 32 : 28;
  const headingSize = "$6";
  const paddingSize = media.gtSm ? "$5" : "$4";
  const bodySize = media.gtSm ? "$4" : "$3";

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
      <XStack gap="$3" alignItems="center">
        {/* Icon Container */}
        <YStack
          width={iconContainerSize}
          height={iconContainerSize}
          borderRadius="$3"
          borderWidth={1}
          borderColor="$borderColor"
          {...{ backgroundColor: `${iconColor}15` as any }}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name={icon as any} size={iconSize} color={iconColor} />
        </YStack>

        {/* Content */}
        <YStack flex={1} gap="$1">
          <TText fontSize={headingSize} fontWeight="800" numberOfLines={1}>
            {title}
          </TText>
          <TText variant="body" fontSize={bodySize} opacity={0.8}>
            {description}
          </TText>
        </YStack>
      </XStack>
    </Card>
  );
};

export default TActionCard;
