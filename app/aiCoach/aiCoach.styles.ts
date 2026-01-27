import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  avoider: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: ScreenPadding.bottom,
    paddingBottom: 160,
    gap: Spacing.md,
  },
  inputBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
  },
});
