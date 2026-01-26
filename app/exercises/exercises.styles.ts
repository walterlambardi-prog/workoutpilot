import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: ScreenPadding.horizontal,
  },
  separator: {
    height: Spacing.md,
  },
});

export default styles;
