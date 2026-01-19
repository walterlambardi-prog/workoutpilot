import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 16,
    paddingTop: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 4,
  },
  cards: {
    gap: 12,
  },
  card: {
    borderRadius: 12,
    padding: 16,
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
