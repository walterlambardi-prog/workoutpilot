import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  page: {
    flex: 1,
    paddingTop: 49,
    padding: 24,
    gap: 16,
  },
  heroContainer: {
    gap: 8,
    marginBottom: 16,
  },
  languageContainer: {
    gap: 8,
    marginBottom: 16,
  },
  languageToggle: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#253046",
    backgroundColor: "#0D1524",
    padding: 4,
    gap: 4,
  },
  languagePill: {
    flex: 1,
    paddingVertical: 8,
    alignItems: "center",
    borderRadius: 999,
  },
  languagePillActive: {
    backgroundColor: "#111827",
    borderWidth: 1,
    borderColor: "#60A5FA",
    shadowColor: "#60A5FA",
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  languagePillPressed: {
    opacity: 0.9,
  },
  languagePillText: {
    fontWeight: "700",
    letterSpacing: 0.5,
    color: "#E5E7EB",
  },
  languagePillTextActive: {
    color: "#BFDBFE",
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  actionCard: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#3A3D46",
    backgroundColor: "#111827",
  },
  actionCardPressed: {
    opacity: 0.85,
  },
});

export default styles;
