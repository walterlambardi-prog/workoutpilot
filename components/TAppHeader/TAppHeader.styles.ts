import {
    PressableStateCallbackType,
    StyleSheet,
    ViewStyle,
} from "react-native";

export const avatarShadowStyle: ViewStyle = {
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 4,
  shadowOffset: { width: 0, height: 2 },
  elevation: 2,
};

const styles = StyleSheet.create({
  menuButton: {
    padding: 8,
    borderRadius: 8,
  },
  menuButtonPressed: {
    opacity: 0.5,
  },
  avatarPressable: {
    paddingVertical: 4,
    paddingRight: 4,
    flex: 1,
    minWidth: 0,
  },
  avatarPressablePressed: {
    opacity: 0.7,
  },
});

export const getMenuButtonStyle = ({ pressed }: PressableStateCallbackType) => [
  styles.menuButton,
  pressed && styles.menuButtonPressed,
];

export const getAvatarPressableStyle = ({
  pressed,
}: PressableStateCallbackType) => [
  styles.avatarPressable,
  pressed && styles.avatarPressablePressed,
];
