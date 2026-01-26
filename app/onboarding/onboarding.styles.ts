import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: "100%",
    maxWidth: 300,
    aspectRatio: 1,
    borderRadius: Spacing.xxl,
    overflow: "hidden",
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
  button: {
    flex: 1,
    borderRadius: Spacing.md,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: "#3b82f6",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: "#ffffff",
  },
  buttonTextSecondary: {
    color: "#3b82f6",
  },
});

export default styles;
