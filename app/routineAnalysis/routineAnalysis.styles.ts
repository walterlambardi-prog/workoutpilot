import { Platform, StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingVertical: ScreenPadding.vertical,
  },
  scrollContent: {
    paddingBottom: Platform.OS === "web" ? 0 : Spacing.xxxl + Spacing.xxxl,
  },
  content: {
    gap: Spacing.md,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: Spacing.lg,
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
  },
  errorContainer: {
    padding: Spacing.lg,
    borderRadius: Spacing.md,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 15,
    marginBottom: Spacing.sm,
  },
  retryButton: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.sm,
    alignItems: "center",
    marginTop: Spacing.md,
  },
  retryButtonText: {
    fontSize: 15,
    fontWeight: "600",
  },
  reanalyzeButton: {
    paddingVertical: Spacing.lg,
    paddingHorizontal: Spacing.xl,
    borderRadius: Spacing.md,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.md,
  },
  reanalyzeButtonText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#ffffff",
  },
  scoreCard: {
    padding: Spacing.xl,
    borderRadius: Spacing.md,
    borderWidth: 1,
    alignItems: "center",
    gap: Spacing.sm,
  },
  scoreValue: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 52,
  },
  scoreLabel: {
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  card: {
    borderRadius: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: Spacing.md,
  },
  feedbackText: {
    fontSize: 15,
    lineHeight: 22,
  },
  listItem: {
    flexDirection: "row",
    gap: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  bullet: {
    fontSize: 15,
    lineHeight: 22,
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  exerciseCard: {
    padding: Spacing.md,
    borderRadius: Spacing.sm,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  exerciseHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
  },
  exerciseScore: {
    fontSize: 18,
    fontWeight: "700",
  },
  exerciseFeedback: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xs,
  },
  suggestionItem: {
    fontSize: 13,
    lineHeight: 18,
    marginLeft: Spacing.md,
  },
});

export default styles;
