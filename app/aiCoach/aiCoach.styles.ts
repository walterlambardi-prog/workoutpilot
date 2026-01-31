import { Layout } from "@/constants/theme";
import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  avoider: {
    flex: 1,
  },
  inputBar: {
    position: "absolute",
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 10,
    borderTopWidth: 1,
    width: "100%",
    maxWidth: Platform.OS === "web" ? Layout.maxContentWidth : undefined,
    alignSelf: "center",
  },
});
