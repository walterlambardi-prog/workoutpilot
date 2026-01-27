import { Platform, StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: ScreenPadding.vertical,
    paddingBottom: ScreenPadding.bottom + Spacing.xxxl,
    gap: Spacing.lg,
  },
  coverImage: {
    width: "100%",
    height: Platform.OS === "web" ? 360 : 320,
    borderRadius: Spacing.lg,
  },
});
