import { THeading, TText } from "@/components/TText";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Card, XStack, YStack } from "tamagui";

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
  return (
    <Card
      elevate
      size="$4"
      bordered
      animation="bouncy"
      scale={0.98}
      hoverStyle={{ scale: 1 }}
      pressStyle={{ scale: 0.96 }}
      onPress={onPress}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
      backgroundColor="$background"
      borderColor="$borderColor"
      padding="$4"
      cursor="pointer"
    >
      <XStack space="$3" alignItems="center">
        {/* Icon Container */}
        <YStack
          width={80}
          height={80}
          borderRadius="$3"
          borderWidth={1}
          borderColor="$borderColor"
          {...{ backgroundColor: `${iconColor}15` as any }}
          alignItems="center"
          justifyContent="center"
        >
          <Ionicons name={icon as any} size={32} color={iconColor} />
        </YStack>

        {/* Content */}
        <YStack flex={1} space="$1">
          <THeading level={3} fontSize="$5">
            {title}
          </THeading>
          <TText variant="caption" opacity={0.8}>
            {description}
          </TText>
        </YStack>
      </XStack>
    </Card>
  );
};

export default TActionCard;
