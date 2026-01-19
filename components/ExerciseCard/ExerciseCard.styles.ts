import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 12,
  },
  cardLight: {
    backgroundColor: "#f8fafc",
    borderColor: "#e2e8f0",
  },
  cardDark: {
    backgroundColor: "#0f172a",
    borderColor: "#1f2937",
  },
  cardPressed: {
    opacity: 0.92,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: "#111827",
  },
  content: {
    flex: 1,
    gap: 6,
  },
  description: {
    opacity: 0.8,
  },
  cta: {
    marginTop: 6,
    fontWeight: "600",
    color: "#0ea5e9",
  },
});

export default styles;
