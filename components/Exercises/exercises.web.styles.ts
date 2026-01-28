import type { CSSProperties } from "react";

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
