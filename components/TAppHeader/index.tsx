import { TDrawer } from "@/components/TDrawer";
import { TText } from "@/components/TText";
import { useAuthStore } from "@/stores/authStore";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme, XStack, YStack } from "tamagui";

import { usePathname, useRouter } from "expo-router";
import {
    avatarShadowStyle,
    getAvatarPressableStyle,
    getMenuButtonStyle,
} from "./TAppHeader.styles";

export interface TAppHeaderProps {
  showMenuButton?: boolean;
}

/**
 * App header component with user info and navigation drawer
 * Displays user avatar/icon, username, and menu button
 *
 * @example
 * ```tsx
 * <TAppHeader />
 * ```
 */
export const TAppHeader: React.FC<TAppHeaderProps> = ({
  showMenuButton = true,
}) => {
  const username = useAuthStore((state: any) => state.username);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const iconColor = theme.color.get();
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();

  const handleMenuPress = () => {
    setIsDrawerOpen(true);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
  };

  const handleAvatarPress = () => {
    if (pathname === "/") return;
    router.push("/");
  };

  return (
    <>
      <XStack
        paddingHorizontal="$4"
        paddingTop={insets.top + 12}
        paddingBottom="$4"
        minHeight={64}
        alignItems="center"
        justifyContent="space-between"
        backgroundColor="$background"
        borderBottomWidth={1}
        borderBottomColor="$borderColor"
      >
        {/* Left side: User info */}
        <Pressable onPress={handleAvatarPress} style={getAvatarPressableStyle}>
          <XStack gap="$3" alignItems="center" flex={1} minWidth={0}>
            {/* User avatar/icon */}
            <YStack
              width={44}
              height={44}
              borderRadius={22}
              backgroundColor="$backgroundHover"
              alignItems="center"
              justifyContent="center"
              borderWidth={2}
              borderColor="$background"
              style={avatarShadowStyle}
            >
              <Ionicons name="person" size={22} color={iconColor} />
            </YStack>

            {/* Username */}
            <YStack flex={1}>
              <TText
                fontSize="$3"
                variant="caption"
                opacity={0.6}
                color="$color"
              >
                {t("header.welcome")}
              </TText>
              <TText fontSize="$5" numberOfLines={1} color="$color">
                {t("header.greeting", {
                  name: username || t("header.defaultUser"),
                })}
              </TText>
            </YStack>
          </XStack>
        </Pressable>

        {/* Right side: Menu button */}
        {showMenuButton && (
          <Pressable onPress={handleMenuPress} style={getMenuButtonStyle}>
            <Ionicons name="menu" size={28} color={iconColor} />
          </Pressable>
        )}
      </XStack>

      {/* Drawer */}
      <TDrawer isOpen={isDrawerOpen} onClose={handleCloseDrawer} />
    </>
  );
};

export default TAppHeader;
