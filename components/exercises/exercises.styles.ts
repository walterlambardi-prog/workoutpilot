import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0f172a",
  },
  header: {
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#cbd5e1",
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
    backgroundColor: "#38bdf8",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#0b1220",
    fontSize: 16,
    fontWeight: "700",
  },
  statsContainer: {
    backgroundColor: "#0b1220",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#1f2937",
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    gap: 8,
  },
  statLabel: {
    fontSize: 14,
    color: "#cbd5e1",
    fontWeight: "600",
  },
  statValue: {
    fontSize: 14,
    color: "#e2e8f0",
  },
  message: {
    fontSize: 14,
    color: "#e2e8f0",
    marginTop: 4,
  },
  footer: {
    marginTop: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  footerText: {
    fontSize: 12,
    color: "#94a3b8",
  },
});

export default styles;
