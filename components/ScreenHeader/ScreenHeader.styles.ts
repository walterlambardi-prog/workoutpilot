import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.md,
  },
  title: {
    lineHeight: 36,
  },
  subtitle: {
    opacity: 0.8,
    marginTop: Spacing.xs,
  },
});

export default styles;
