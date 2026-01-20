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
