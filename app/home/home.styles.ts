import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  page: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: ScreenPadding.bottom,
    gap: Spacing.lg,
  },
  heroContainer: {
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  actionsContainer: {
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
});

export default styles;
