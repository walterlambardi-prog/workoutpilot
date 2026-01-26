import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  page: {
    flex: 1,
    paddingTop: ScreenPadding.vertical,
    paddingHorizontal: ScreenPadding.horizontal,
  },
  section: {
    marginTop: Spacing.xxl,
    gap: Spacing.md,
  },
  sectionTitle: {
    marginBottom: Spacing.sm,
  },
  sectionDescription: {
    opacity: 0.7,
    fontSize: 14,
    lineHeight: 20,
  },
  languageToggle: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
  },
  languagePill: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#888",
    backgroundColor: "transparent",
  },
  languagePillActive: {
    borderColor: "#007AFF",
    backgroundColor: "#007AFF",
  },
  languagePillPressed: {
    opacity: 0.7,
  },
  languagePillText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#888",
  },
  languagePillTextActive: {
    color: "#FFF",
  },
  actionButton: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#888",
    backgroundColor: "transparent",
  },
  actionButtonDestructive: {
    borderColor: "#FF3B30",
  },
  actionButtonPressed: {
    opacity: 0.7,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  actionButtonTextDestructive: {
    color: "#FF3B30",
  },
});

export default styles;
