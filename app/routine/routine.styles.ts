import { StyleSheet } from "react-native";

import { ScreenPadding, Spacing } from "@/constants/theme";

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: ScreenPadding.horizontal,
    paddingBottom: ScreenPadding.bottom,
  },
  header: {
    paddingTop: ScreenPadding.vertical,
    paddingBottom: Spacing.md,
  },
  roundsCard: {
    borderRadius: 24,
    borderWidth: 1,
    marginTop: 16,
    overflow: "hidden",
  },
  roundsBackground: {
    borderRadius: 24,
    overflow: "hidden",
    width: "100%",
    alignSelf: "stretch",
    minHeight: 180,
  },
  roundsBackgroundImage: {
    borderRadius: 24,
    width: "100%",
    height: "100%",
  },
  roundsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  roundsContent: {
    padding: 20,
  },
  roundsCardLight: {
    backgroundColor: "#F9FAFB",
    borderColor: "rgba(15,23,42,0.08)",
  },
  roundsCardDark: {
    backgroundColor: "rgba(255,255,255,0.03)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  roundsDescription: {
    marginTop: 6,
    opacity: 0.8,
  },
  roundsValueRow: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  roundsValue: {
    fontSize: 40,
    fontWeight: "700",
    lineHeight: 48,
    marginHorizontal: 24,
  },
  stepperValue: {
    fontSize: 20,
    fontWeight: "600",
    marginHorizontal: 4,
  },
  stepperButton: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    backgroundColor: "rgba(15,23,42,0.35)",
    borderColor: "rgba(248,250,252,0.6)",
  },
  stepperButtonCompact: {
    width: 32,
    height: 32,
    borderWidth: 1,
    borderColor: "rgba(248,250,252,0.35)",
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  stepperButtonPressed: {
    transform: [{ scale: 0.97 }],
  },
  stepperButtonDisabled: {
    opacity: 0.4,
  },
  sectionHeading: {
    marginTop: 32,
    marginBottom: 12,
  },
  sectionSubtitle: {
    marginTop: 4,
    opacity: 0.8,
  },
  sectionCaption: {
    marginTop: 4,
    fontSize: 14,
    opacity: 0.65,
  },
  exerciseCard: {
    borderRadius: 24,
    borderWidth: 1,
    shadowColor: "#0F172A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 18,
    elevation: 3,
    overflow: "hidden",
  },
  exerciseCardLight: {
    backgroundColor: "#0B1120",
    borderColor: "rgba(15,23,42,0.08)",
  },
  exerciseCardDark: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderColor: "rgba(255,255,255,0.18)",
  },
  exerciseCardDisabled: {},
  exerciseBackground: {
    width: "100%",
    minHeight: 190,
    justifyContent: "flex-end",
  },
  exerciseBackgroundImage: {
    borderRadius: 24,
  },
  exerciseOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  exerciseOverlayLight: {
    backgroundColor: "rgba(15,23,42,0.55)",
  },
  exerciseOverlayDark: {
    backgroundColor: "rgba(2,6,23,0.45)",
  },
  exerciseOverlayDisabled: {
    backgroundColor: "rgba(2,6,23,0.65)",
  },
  exerciseDimmed: {
    opacity: 0.55,
  },
  exerciseContent: {
    padding: 20,
    flex: 1,
    justifyContent: "space-between",
  },
  exerciseTop: {
    width: "100%",
    marginBottom: 12,
  },
  exerciseHeader: {
    marginBottom: 2,
  },
  exerciseTitleBlock: {
    flexGrow: 1,
    flexShrink: 1,
    paddingRight: 12,
  },
  exerciseTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  exerciseDescription: {
    marginTop: 8,
    opacity: 0.92,
    marginBottom: 4,
  },
  exerciseFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    flexWrap: "wrap",
  },
  repsColumn: {
    width: "100%",
    flexShrink: 1,
    alignItems: "flex-start",
  },
  repsRow: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
  },
  repsStepper: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(248,250,252,0.35)",
    backgroundColor: "rgba(15,23,42,0.4)",
  },
  selectionButton: {
    marginTop: 0,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    justifyContent: "center",
    minHeight: 36,
  },
  selectionButtonPressed: {
    opacity: 0.92,
  },
  selectionButtonSelected: {
    backgroundColor: "rgba(22,163,74,0.3)",
    borderColor: "rgba(22,163,74,0.8)",
  },
  selectionButtonUnselected: {
    backgroundColor: "rgba(15,23,42,0.35)",
    borderColor: "rgba(248,250,252,0.25)",
  },
  selectionIcon: {
    marginRight: 6,
  },
  selectionLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  separator: {
    height: 16,
  },
  footer: {
    paddingTop: 24,
  },
  ctaButton: {
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: "center",
    backgroundColor: "#16A34A",
  },
  ctaButtonDisabled: {
    opacity: 0.45,
  },
  ctaButtonPressed: {
    opacity: 0.85,
  },
  ctaLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default styles;
