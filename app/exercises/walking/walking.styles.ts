import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  statCard: {
    flex: 1,
  },
  mapWrapper: {
    flex: 1,
    width: "100%",
    minHeight: Spacing.xxxl * 10,
    borderRadius: Spacing.lg,
    overflow: "hidden",
  },
});

export default styles;
