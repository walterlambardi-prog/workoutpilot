import React from "react";
import { CardProps, Card as TamaguiCard } from "tamagui";

import {
  CARD_BASE_PROPS,
  CARD_HOVER_STYLE,
  CARD_PRESS_STYLE,
} from "./TCard.styles";

export interface TCardProps extends CardProps {
  elevated?: boolean;
}

/**
 * Custom Card component built with Tamagui
 *
 * @example
 * ```tsx
 * <TCard>
 *   <Text>Card content</Text>
 * </TCard>
 *
 * <TCard padding="$4">
 *   <Text>card with padding</Text>
 * </TCard>
 * ```
 */
export const TCard: React.FC<TCardProps> = ({
  elevated = false,
  children,
  ...props
}) => {
  return (
    <TamaguiCard
      {...CARD_BASE_PROPS}
      elevate={elevated}
      hoverStyle={CARD_HOVER_STYLE}
      pressStyle={CARD_PRESS_STYLE}
      {...props}
    >
      {children}
    </TamaguiCard>
  );
};

export default TCard;
