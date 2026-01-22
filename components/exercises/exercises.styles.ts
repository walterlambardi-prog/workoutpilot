import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#000",
  },
  cameraWrapper: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 20,
  },
  scrim: {
    ...StyleSheet.absoluteFillObject,
  },
  overlayContent: {
    flex: 1,
    justifyContent: "space-between",
  },
  topSection: {
    gap: 24,
  },
  headerBlock: {
    gap: 8,
    borderRadius: 24,
    padding: 20,
  },
  heading: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "700",
  },
  subheading: {
    fontSize: 16,
    lineHeight: 22,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  chipLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    fontWeight: "600",
  },
  chipValue: {
    fontSize: 16,
    fontWeight: "700",
  },
  bottomCard: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    gap: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  progressCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    gap: 10,
  },
  progressLabel: {
    fontSize: 14,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  progressTrack: {
    height: 10,
    borderRadius: 999,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  nextExercise: {
    fontSize: 13,
    fontWeight: "600",
  },
  switchButton: {
    borderRadius: 16,
    paddingVertical: 16,
    alignItems: "center",
  },
  switchButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});

export default styles;
