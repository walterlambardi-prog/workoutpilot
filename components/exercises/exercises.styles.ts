import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 4,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 14,
  },
  cameraContainer: {
    alignItems: "center",
    marginVertical: 16,
    borderRadius: 12,
    overflow: "hidden",
    marginHorizontal: 16,
  },
  controls: {
    paddingHorizontal: 16,
    gap: 16,
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  statsContainer: {
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  statValue: {
    fontSize: 14,
  },
  message: {
    fontSize: 14,
    marginTop: 4,
  },
  footer: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
});

export default styles;
