import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#0f172a",
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
    color: "#f8fafc",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
    color: "#cbd5e1",
    marginTop: 4,
  },
  cards: {
    gap: 12,
  },
  card: {
    backgroundColor: "#0b1220",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#e2e8f0",
    marginBottom: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
  },
  statLabel: {
    color: "#cbd5e1",
    fontSize: 14,
  },
  statValue: {
    color: "#f8fafc",
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
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#233044",
  },
  chipLabel: {
    color: "#cbd5e1",
    fontSize: 12,
  },
  empty: {
    color: "#94a3b8",
    fontSize: 14,
    paddingVertical: 4,
  },
  historyItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  historyTitle: {
    color: "#f8fafc",
    fontSize: 15,
    fontWeight: "600",
  },
  historySubtitle: {
    color: "#cbd5e1",
    fontSize: 13,
    marginTop: 2,
  },
  historyMeta: {
    color: "#94a3b8",
    fontSize: 12,
    marginTop: 4,
  },
  breakdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#1f2937",
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2937",
    backgroundColor: "#111827",
  },
  breakdownContent: {
    flex: 1,
  },
  breakdownBadge: {
    alignItems: "flex-end",
  },
});

export default styles;
