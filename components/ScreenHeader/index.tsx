import React from "react";
import { GetThemeValueForKey, YStack } from "tamagui";

import { THeading, TText } from "@/components/TText";

import type { ScreenHeaderProps } from "./ScreenHeader.types";

/**
 * ScreenHeader component for consistent page headers across the app
 * Displays title and optional subtitle with standardized styling
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({
  title,
  subtitle,
  titleShadow,
  align = "left",
}) => {
  const shadowColor = titleShadow?.color as
    | GetThemeValueForKey<"textShadowColor">
    | undefined;
  const shadowOffset =
    titleShadow?.offset &&
    titleShadow.offset.width !== undefined &&
    titleShadow.offset.height !== undefined
      ? {
          width: titleShadow.offset.width,
          height: titleShadow.offset.height,
        }
      : undefined;

  const textAlign = align === "center" ? "center" : "left";
  const containerAlignment = align === "center" ? "center" : "flex-start";

  return (
    <YStack gap="$2" marginBottom="$3" alignItems={containerAlignment}>
      <THeading
        level={1}
        textShadowColor={shadowColor}
        textShadowRadius={titleShadow?.radius}
        textShadowOffset={shadowOffset}
        textAlign={textAlign}
      >
        {title}
      </THeading>
      {subtitle && (
        <TText opacity={0.8} textAlign={textAlign}>
          {subtitle}
        </TText>
      )}
    </YStack>
  );
};

export default ScreenHeader;
