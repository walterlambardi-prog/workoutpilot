import { StyleSheet } from "react-native";

import { Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: Spacing.xxl,
    justifyContent: "center",
  },
  content: {
    maxWidth: 500,
    width: "100%",
    alignSelf: "center",
  },
  header: {
    marginBottom: Spacing.xxxl + Spacing.lg,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    marginBottom: Spacing.sm,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: Spacing.md,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    opacity: 0.7,
  },
  form: {
    gap: Spacing.xxl,
  },
  inputContainer: {
    gap: Spacing.sm,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
  },
  input: {
    borderWidth: 2,
    borderRadius: Spacing.md,
    padding: Spacing.lg,
    fontSize: 18,
    fontWeight: "500",
  },
  inputFocused: {
    borderWidth: 3,
  },
  errorText: {
    fontSize: 14,
    color: "#ef4444",
    marginTop: Spacing.xxs,
  },
  button: {
    backgroundColor: "#3b82f6",
    borderRadius: Spacing.md,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    marginTop: Spacing.sm,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
});

export default styles;
