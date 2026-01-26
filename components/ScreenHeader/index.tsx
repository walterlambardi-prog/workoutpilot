import React from "react";
import { YStack } from "tamagui";

import { THeading, TText } from "@/components/TText";

import type { ScreenHeaderProps } from "./ScreenHeader.types";

/**
 * ScreenHeader component for consistent page headers across the app
 * Displays title and optional subtitle with standardized styling
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle }) => {
  return (
    <YStack gap="$2" marginBottom="$3">
      <THeading level={1} lineHeight={36}>
        {title}
      </THeading>
      {subtitle && <TText opacity={0.8}>{subtitle}</TText>}
    </YStack>
  );
};

export default ScreenHeader;
