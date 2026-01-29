import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

export const THUMB_SIZE = Spacing.xxxl * 2;

const styles = StyleSheet.create({
  thumbImage: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
  },
});

export default styles;
