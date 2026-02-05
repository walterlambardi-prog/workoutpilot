import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: ScreenPadding.vertical,
    paddingTop: ScreenPadding.vertical,
    paddingBottom: Spacing.lg,
  },
  stepContainer: {
    flex: 1,
    padding: ScreenPadding.vertical,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.xxxl + Spacing.sm,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  imageContainer: {
    width: 220,
    height: 220,
    borderRadius: 24,
    overflow: "hidden",
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 100,
  },
  textContent: {
    gap: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
  },
  bottomControls: {
    gap: Spacing.xl,
    paddingHorizontal: ScreenPadding.vertical,
    paddingBottom: Spacing.xxxl + Spacing.sm,
    paddingTop: Spacing.xl,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  dot: {
    width: Spacing.sm,
    height: Spacing.sm,
    borderRadius: Spacing.xxs,
    backgroundColor: "#d1d5db",
  },
  dotActive: {
    width: Spacing.xxl,
    backgroundColor: "#3b82f6",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
});

export default styles;
