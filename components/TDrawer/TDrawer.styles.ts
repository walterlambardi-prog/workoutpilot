import { Layout } from "@/constants/theme";
import {
  Dimensions,
  Platform,
  PressableStateCallbackType,
  StyleSheet,
  ViewStyle,
} from "react-native";

const drawerPanelBase: ViewStyle = {
  maxWidth: 400,
  height: "100%",
};

export const drawerStyles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    flexDirection: "row",
  },
  // Web: backdrop with centered content area
  backdropWeb: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    alignItems: "center",
  },
  // Web: container respecting maxContentWidth
  webContentContainer: {
    width: "100%",
    maxWidth: Layout.maxContentWidth,
    height: "100%",
    flexDirection: "row",
  },
  closeButton: {
    padding: 8,
  },
  closeButtonPressed: {
    opacity: 0.6,
  },
  navItemPressable: {},
  navItemPressableActive: {
    opacity: 1,
  },
  navItemPressablePressed: {
    opacity: 0.6,
  },
});

export const getDrawerPanelStyle = (): ViewStyle => {
  if (Platform.OS === "web") {
    const screenWidth = Dimensions.get("window").width;
    const contentWidth = Math.min(screenWidth, Layout.maxContentWidth);
    return {
      ...drawerPanelBase,
      width: Math.min(320, contentWidth * 0.35), // Max 35% of content area or 320px
    };
  }

  return {
    ...drawerPanelBase,
    width: "80%",
  };
};

export const getCloseButtonStyle = ({
  pressed,
}: PressableStateCallbackType) => [
  drawerStyles.closeButton,
  pressed && drawerStyles.closeButtonPressed,
];

export const getNavItemPressableStyle = (
  { pressed }: PressableStateCallbackType,
  isActive?: boolean,
) => [
  drawerStyles.navItemPressable,
  isActive && drawerStyles.navItemPressableActive,
  pressed && drawerStyles.navItemPressablePressed,
];
