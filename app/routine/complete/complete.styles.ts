import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  hero: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 10,
  },
  heroTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: "800",
  },
  heroSubtitle: {
    fontSize: 16,
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  statCard: {
    flexGrow: 1,
    minWidth: "45%",
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 6,
  },
  statLabel: {
    fontSize: 13,
    fontWeight: "600",
    opacity: 0.75,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: "#16A34A",
    borderColor: "#15803D",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
  },
  buttonText: {
    fontSize: 15,
    fontWeight: "700",
  },
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  summaryRounds: {
    gap: 12,
  },
  summaryRound: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
    gap: 8,
  },
  summaryRoundHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  summaryRoundTitle: {
    fontSize: 15,
    fontWeight: "800",
  },
  summaryRoundMeta: {
    fontSize: 13,
    fontWeight: "600",
  },
  summaryHeader: {
    fontSize: 18,
    fontWeight: "800",
  },
  summaryItem: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  summaryItemLast: {
    borderBottomWidth: 0,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  summaryMeta: {
    fontSize: 13,
    opacity: 0.8,
    marginTop: 2,
  },
});

export default styles;
