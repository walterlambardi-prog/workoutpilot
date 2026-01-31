import { Platform, StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  coverImage: {
    width: "100%",
    height: Platform.OS === "web" ? 360 : 320,
    borderRadius: Spacing.lg,
  },
});
