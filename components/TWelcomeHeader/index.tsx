import { HelloWave } from "@/components/HelloWave";
import { THeading, TText } from "@/components/TText";
import React from "react";
import { XStack, YStack } from "tamagui";

export interface TWelcomeHeaderProps {
  title: string;
  subtitle?: string;
  description?: string;
  showWave?: boolean;
}

/**
 * Welcome header component for screens
 * Displays title with optional wave animation, subtitle and description
 *
 * @example
 * ```tsx
 * <TWelcomeHeader
 *   title="Welcome Back"
 *   subtitle="Ready to train?"
 *   description="Choose an action below to get started"
 *   showWave
 * />
 * ```
 */
export const TWelcomeHeader: React.FC<TWelcomeHeaderProps> = ({
  title,
  subtitle,
  description,
  showWave = false,
}) => {
  return (
    <YStack gap="$3">
      {/* Title with wave */}
      <XStack gap="$2" alignItems="center">
        <THeading level={1}>{title}</THeading>
        {showWave && <HelloWave />}
      </XStack>

      {/* Subtitle and description */}
      {(subtitle || description) && (
        <YStack gap="$2">
          {subtitle && (
            <THeading level={3} fontWeight="600">
              {subtitle}
            </THeading>
          )}
          {description && <TText opacity={0.8}>{description}</TText>}
        </YStack>
      )}
    </YStack>
  );
};

export default TWelcomeHeader;
