import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const DEFAULT_WEEKS = 20;
export const DEFAULT_SQUARE_SIZE = 14;
export const DEFAULT_GAP = 4;

const styles = StyleSheet.create({
  pill: {
    borderRadius: Spacing.sm,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },
  svgWrapper: {
    width: "100%",
  },
  legendSwatch: {
    width: Spacing.lg,
    height: Spacing.lg,
    borderRadius: Spacing.xxs,
    borderWidth: 1,
  },
});

export default styles;
