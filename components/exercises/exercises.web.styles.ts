import type { CSSProperties } from "react";
import { StyleSheet } from "react-native";

export const rnStyles = StyleSheet.create({
  screen: {
    flex: 1,
    width: "100%",
    paddingHorizontal: 32,
    paddingVertical: 48,
    alignItems: "center",
  },
  content: {
    width: "100%",
    maxWidth: 1280,
    alignSelf: "center",
  },
  hero: {
    position: "relative",
    borderRadius: 32,
    overflow: "hidden",
    borderWidth: 1,
    minHeight: 560,
    aspectRatio: 16 / 9,
    width: "100%",
  },
  mediaLayer: {
    flex: 1,
    height: "100%",
    position: "relative",
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
    maxWidth: "55%",
  },
  headerBlock: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderStyle: "solid",
    gap: 12,
    maxWidth: 680,
  },
  title: {
    fontSize: 48,
    fontWeight: "700",
    lineHeight: 52,
    marginBottom: 0,
  },
  subtitle: {
    fontSize: 18,
    lineHeight: 24,
    marginBottom: 0,
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
    borderWidth: 1,
    borderStyle: "solid",
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
  overlayBottom: {
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderStyle: "solid",
    maxWidth: 480,
    gap: 16,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
  },
  progressCard: {
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderStyle: "solid",
    gap: 12,
  },
  progressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
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
  },
  canvas: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
  },
};
