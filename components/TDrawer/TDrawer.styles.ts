import {
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

export const getDrawerPanelStyle = (): ViewStyle => ({
  ...drawerPanelBase,
  width: Platform.OS === "web" ? 320 : "80%",
});

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
