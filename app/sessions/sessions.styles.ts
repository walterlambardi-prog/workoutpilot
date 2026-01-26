import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: ScreenPadding.horizontal,
    paddingTop: ScreenPadding.vertical,
    paddingBottom: ScreenPadding.bottom,
  },
  cards: {
    gap: Spacing.md,
  },
  card: {
    borderRadius: Spacing.md,
    padding: Spacing.lg,
    borderWidth: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  statLabel: {
    fontSize: 14,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 12,
  },
  empty: {
    fontSize: 14,
    paddingVertical: 4,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  historySubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  historyMeta: {
    fontSize: 12,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "transparent",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownBadge: {
    alignItems: "flex-end",
  },
});

export default styles;
