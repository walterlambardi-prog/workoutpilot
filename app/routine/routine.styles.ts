import { Platform, StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const styles = StyleSheet.create({
  coverImage: {
    width: "100%",
    height: Platform.OS === "web" ? 360 : 320,
    borderRadius: Spacing.lg,
  },
  backgroundImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: "100%",
    height: "100%",
  },
});
