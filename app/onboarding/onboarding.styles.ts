import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 40,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  imageContainer: {
    width: "100%",
    maxWidth: 300,
    aspectRatio: 1,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderIcon: {
    fontSize: 100,
  },
  textContent: {
    gap: 16,
    paddingHorizontal: 16,
    width: "100%",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
    opacity: 0.8,
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
    lineHeight: 24,
  },
  bottomControls: {
    gap: 20,
    paddingHorizontal: 24,
    paddingBottom: 40,
    paddingTop: 20,
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#d1d5db",
  },
  dotActive: {
    width: 24,
    backgroundColor: "#3b82f6",
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  button: {
    flex: 1,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 56,
  },
  buttonPrimary: {
    backgroundColor: "#3b82f6",
  },
  buttonSecondary: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: "#3b82f6",
  },
  buttonPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    color: "#ffffff",
  },
  buttonTextSecondary: {
    color: "#3b82f6",
  },
});

export default styles;
