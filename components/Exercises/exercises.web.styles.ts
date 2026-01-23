import type { CSSProperties } from "react";
import { StyleSheet, type TextStyle, type ViewStyle } from "react-native";
type ViewStyles = {
  screen: ViewStyle;
  content: ViewStyle;
  hero: ViewStyle;
  mediaLayer: ViewStyle;
  mediaFrame: ViewStyle;
  mediaTint: ViewStyle;
  overlayLayer: ViewStyle;
  overlayTop: ViewStyle;
  headerBlock: ViewStyle;
  chipRow: ViewStyle;
  chip: ViewStyle;
  primaryChipRow: ViewStyle;
  primaryChip: ViewStyle;
  overlayBottom: ViewStyle;
  progressCard: ViewStyle;
  progressHeader: ViewStyle;
  progressTrack: ViewStyle;
  progressFill: ViewStyle;
};

type TextStyles = {
  title: TextStyle;
  subtitle: TextStyle;
  chipLabel: TextStyle;
  chipValue: TextStyle;
  primaryChipLabel: TextStyle;
  primaryChipValue: TextStyle;
  message: TextStyle;
  progressLabel: TextStyle;
  progressValue: TextStyle;
  nextExercise: TextStyle;
};

export const rnStyles = StyleSheet.create<ViewStyles & TextStyles>({
  screen: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 0,
    minHeight: "100%",
    alignItems: "center",
  },
  content: {
    width: "100%",
    minHeight: "100%",
    alignSelf: "center",
  },
  hero: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 0,
    height: "100%",
    width: "100%",
  },
  mediaLayer: {
    flex: 1,
    height: "100%",
    position: "relative",
  },
  mediaFrame: {
    ...StyleSheet.absoluteFillObject,
    padding: 0,
  },
  mediaTint: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 2,
  },
  overlayLayer: {
    ...StyleSheet.absoluteFillObject,
    padding: 40,
    justifyContent: "space-between",
  },
  overlayTop: {
    gap: 24,
    paddingEnd: "20%",
  },
  headerBlock: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderStyle: "solid",
    gap: 12,
    maxWidth: 680,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderStyle: "solid",
  },
  primaryChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },
  primaryChip: {
    borderRadius: 24,
    paddingVertical: 20,
    paddingHorizontal: 32,
    borderWidth: 2,
    borderStyle: "solid",
  },
  overlayBottom: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderStyle: "solid",
    maxWidth: 480,
    gap: 16,
  },
  progressCard: {
    gap: 12,
  },
  progressHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  progressTrack: {
    height: 10,
    borderRadius: 24,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 24,
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 52,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  chipLabel: {
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  primaryChipLabel: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 6,
  },
  primaryChipValue: {
    fontSize: 56,
    fontWeight: "800",
    lineHeight: 60,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: "600",
  },
  progressValue: {
    fontSize: 15,
    fontWeight: "700",
  },
  nextExercise: {
    fontSize: 13,
    fontWeight: "600",
  },
});

export const webMediaStyles: { video: CSSProperties; canvas: CSSProperties } = {
  video: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    objectFit: "cover",
    zIndex: 1,
    transform: "scaleX(-1)",
    transformOrigin: "center",
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
    transform: "scaleX(-1)",
    transformOrigin: "center",
  },
};
