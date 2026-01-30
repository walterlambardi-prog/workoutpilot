import { Spacing } from "@/constants/theme";
import { PressableStateCallbackType, StyleSheet } from "react-native";

const styles = StyleSheet.create({
  drawerButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  drawerButtonPressed: {
    opacity: 0.7,
  },
});

export const getDrawerButtonStyle = ({
  pressed,
}: PressableStateCallbackType) => [
  styles.drawerButton,
  pressed && styles.drawerButtonPressed,
];
