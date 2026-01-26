import React from "react";
import { XStack, XStackProps, YStack, YStackProps } from "tamagui";

/**
 * Vertical Stack component for layout
 *
 * @example
 * ```tsx
 * <TStack space="$4" padding="$4">
 *   <Text>Item 1</Text>
 *   <Text>Item 2</Text>
 * </TStack>
 * ```
 */
export const TStack: React.FC<YStackProps> = ({ children, ...props }) => {
  return <YStack {...props}>{children}</YStack>;
};

/**
 * Horizontal Stack component for layout
 *
 * @example
 * ```tsx
 * <TRow space="$2" alignItems="center">
 *   <Icon />
 *   <Text>Label</Text>
 * </TRow>
 * ```
 */
export const TRow: React.FC<XStackProps> = ({ children, ...props }) => {
  return <XStack {...props}>{children}</XStack>;
};

export default TStack;
