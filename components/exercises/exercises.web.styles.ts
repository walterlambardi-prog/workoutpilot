import type { CSSProperties } from "react";
import { StyleSheet } from "react-native";

export const rnStyles = StyleSheet.create({
  page: {
    flex: 1,
  },
  card: {
    marginLeft: "auto",
    marginRight: "auto",
    padding: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    marginTop: 0,
    marginBottom: 0,
    fontSize: 28,
    fontWeight: "700",
  },
  subtitle: {
    marginTop: 6,
    marginBottom: 0,
    fontSize: 14,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  actions: {
    width: 320,
    borderWidth: 1,
    borderStyle: "solid",
    borderRadius: 12,
    padding: 16,
    marginRight: 16,
  },
  status: {
    fontSize: 14,
  },
  message: {
    fontSize: 14,
    minHeight: 20,
  },
  statsBox: {
    flexDirection: "row",
  },
  overlayColumn: {
    flex: 1,
  },
  videoShell: {
    position: "relative",
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: 1,
    borderStyle: "solid",
    minHeight: 320,
  },
});

export const buttonStyles: {
  primary: CSSProperties;
  secondary: CSSProperties;
} = {
  primary: {
    padding: "12px 16px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontWeight: 700,
    fontSize: 16,
  },
  secondary: {
    padding: "10px 16px",
    borderRadius: 10,
    borderWidth: 1,
    borderStyle: "solid",
    cursor: "pointer",
    background: "transparent",
    fontWeight: 600,
    fontSize: 15,
  },
};

export const webMediaStyles: { video: CSSProperties; canvas: CSSProperties } = {
  video: {
    width: "100%",
    height: "100%",
    display: "block",
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
    zIndex: 2,
  },
};
