import { Layout } from "@/constants/theme";
import React from "react";
import { Platform, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, ScrollViewProps, YStack, YStackProps } from "tamagui";

export interface TPageProps extends YStackProps {
  children: React.ReactNode;
  scrollable?: boolean;
  showsVerticalScrollIndicator?: boolean;
  hasHeader?: boolean;
  fullWidth?: boolean;
  scrollRef?: React.RefObject<any>;
  keyboardShouldPersistTaps?: ScrollViewProps["keyboardShouldPersistTaps"];
  keyboardDismissMode?: ScrollViewProps["keyboardDismissMode"];
  onContentSizeChange?: ScrollViewProps["onContentSizeChange"];
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
  fullWidth = false,
  scrollRef,
  keyboardShouldPersistTaps,
  keyboardDismissMode,
  onContentSizeChange,
  ...props
}) => {
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === "web";
  const contentMaxWidth =
    !fullWidth && isWeb ? Layout.maxContentWidth : undefined;
  const contentAlignSelf = contentMaxWidth ? "center" : "stretch";
  const scrollWidthStyle: ViewStyle | undefined = isWeb
    ? { width: "100%" }
    : undefined;

  const content = (
    <YStack
      paddingHorizontal="$4"
      paddingTop={hasHeader ? "$4" : 30 + insets.top}
      paddingBottom="$7"
      gap="$4"
      width="100%"
      maxWidth={contentMaxWidth}
      alignSelf={contentAlignSelf}
      {...props}
    >
      {children}
    </YStack>
  );

  if (scrollable) {
    return (
      <YStack flex={1} backgroundColor="$background">
        <ScrollView
          ref={scrollRef}
          style={scrollWidthStyle}
          showsVerticalScrollIndicator={showsVerticalScrollIndicator}
          keyboardShouldPersistTaps={keyboardShouldPersistTaps}
          keyboardDismissMode={keyboardDismissMode}
          onContentSizeChange={onContentSizeChange}
          contentContainerStyle={{ flexGrow: 1, width: "100%" }}
        >
          {content}
        </ScrollView>
      </YStack>
    );
  }

  return content;
};

export default TPage;
