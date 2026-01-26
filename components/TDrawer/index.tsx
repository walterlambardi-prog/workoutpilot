import { THeading } from "@/components/TText";
import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Modal, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ScrollView, XStack, YStack, useTheme } from "tamagui";

import {
    drawerStyles,
    getCloseButtonStyle,
    getDrawerPanelStyle,
    getNavItemPressableStyle,
} from "./TDrawer.styles";

export interface TDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

interface DrawerItem {
  href: string;
  key: string;
  icon: string;
  color: string;
}

const drawerItems: DrawerItem[] = [
  {
    href: "/",
    key: "home",
    icon: "home-outline",
    color: "#60A5FA",
  },
  {
    href: "/aiCoach",
    key: "aiCoach",
    icon: "chatbubble-ellipses-outline",
    color: "#22D3EE",
  },
  {
    href: "/routine",
    key: "routine",
    icon: "repeat-outline",
    color: "#F87171",
  },
  {
    href: "/exercises",
    key: "exercises",
    icon: "barbell-outline",
    color: "#60A5FA",
  },
  {
    href: "/sessions",
    key: "sessions",
    icon: "stats-chart-outline",
    color: "#34D399",
  },
  {
    href: "/settings",
    key: "settings",
    icon: "settings-outline",
    color: "#A78BFA",
  },
];

/**
 * Navigation drawer component
 * Shows main app routes in a side panel
 *
 * @example
 * ```tsx
 * <TDrawer isOpen={isOpen} onClose={handleClose} />
 * ```
 */
export const TDrawer: React.FC<TDrawerProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();
  const theme = useTheme();
  const iconColor = theme.color.get();

  const handleNavigate = (href: string) => {
    onClose();
    router.push(href as any);
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Backdrop */}
      <Pressable style={drawerStyles.backdrop} onPress={onClose}>
        {/* Drawer panel */}
        <Pressable
          style={getDrawerPanelStyle()}
          onPress={(e) => e.stopPropagation()}
        >
          <YStack
            flex={1}
            backgroundColor="$background"
            paddingTop={insets.top + 16}
            paddingBottom={insets.bottom}
            borderRightWidth={1}
            borderRightColor="$borderColor"
          >
            {/* Header */}
            <XStack
              paddingHorizontal="$4"
              paddingBottom="$4"
              alignItems="center"
              justifyContent="space-between"
              borderBottomWidth={1}
              borderBottomColor="$borderColor"
            >
              <THeading level={2}>{t("drawer.title")}</THeading>
              <Pressable onPress={onClose} style={getCloseButtonStyle}>
                <Ionicons name="close" size={28} color={iconColor} />
              </Pressable>
            </XStack>

            {/* Navigation items */}
            <ScrollView flex={1}>
              <YStack paddingVertical="$2">
                {drawerItems.map((item) =>
                  (() => {
                    const isActive =
                      pathname === item.href ||
                      (item.href !== "/" &&
                        pathname.startsWith(`${item.href}/`));
                    const itemIconColor = isActive ? iconColor : item.color;

                    return (
                      <Pressable
                        key={item.key}
                        onPress={() => handleNavigate(item.href)}
                        style={(state) =>
                          getNavItemPressableStyle(state, isActive)
                        }
                      >
                        <XStack
                          paddingHorizontal="$4"
                          paddingVertical="$3"
                          space="$3"
                          alignItems="center"
                          backgroundColor={
                            isActive ? "$backgroundHover" : undefined
                          }
                          borderLeftWidth={isActive ? 3 : 0}
                          borderLeftColor={isActive ? "$primary" : undefined}
                          hoverStyle={{
                            backgroundColor: "$backgroundHover",
                          }}
                        >
                          {/* Icon */}
                          <YStack
                            width={48}
                            height={48}
                            borderRadius="$3"
                            {...{ backgroundColor: `${item.color}15` as any }}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <Ionicons
                              name={item.icon as any}
                              size={24}
                              color={itemIconColor}
                            />
                          </YStack>

                          {/* Text */}
                          <YStack flex={1}>
                            <THeading level={4} fontSize="$4">
                              {t(`home.actions.${item.key}.title`)}
                            </THeading>
                          </YStack>
                        </XStack>
                      </Pressable>
                    );
                  })(),
                )}
              </YStack>
            </ScrollView>
          </YStack>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default TDrawer;
