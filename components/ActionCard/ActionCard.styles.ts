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
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },
  iconContainerLight: {
    borderColor: "#e2e8f0",
  },
  iconContainerDark: {
    borderColor: "#1f2937",
  },
  content: {
    flex: 1,
    gap: 6,
  },
  subtitle: {
    opacity: 0.8,
  },
});

export default styles;
