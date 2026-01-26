import React from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, YStack, YStackProps } from "tamagui";

export interface TPageProps extends YStackProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showsVerticalScrollIndicator?: boolean;
  hasHeader?: boolean;
}

/**
 * Page container component with safe area handling
 * Provides consistent padding and spacing for all screens
 *
 * @example
 * ```tsx
 * <TPage scrollable>
 *   <TWelcomeHeader title="Home" />
 *   <TActionCard ... />
 * </TPage>
 * ```
 */
export const TPage: React.FC<TPageProps> = ({
  children,
  scrollable = true,
  showsVerticalScrollIndicator = false,
  hasHeader = false,
  ...props
}) => {
  const insets = useSafeAreaInsets();

  const content = (
    <YStack
      paddingHorizontal="$4"
      paddingTop={hasHeader ? "$4" : 30 + insets.top}
      paddingBottom="$7"
      gap="$4"
      {...props}
    >
      {children}
    </YStack>
  );

  if (scrollable) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <ScrollView
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {content}
        </ScrollView>
      </YStack>
    );
  }

  return content;
};

export default TPage;
