import type { CSSProperties } from "react";

const styles: Record<string, CSSProperties> = {
  page: {
    padding: "32px",
    fontFamily:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    minHeight: "100vh",
    color: "#e2e8f0",
    overflowY: "auto",
  },
  card: {
    maxWidth: "1100px",
    margin: "0 auto",
    background: "#0b1220",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 20px 50px rgba(0,0,0,0.35)",
    border: "1px solid #1f2937",
  },
  header: {
    marginBottom: "16px",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#f8fafc",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#cbd5e1",
  },
  row: {
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    gap: "16px",
    alignItems: "start",
  },
  actions: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
    background: "#0f172a",
    border: "1px solid #1f2937",
    borderRadius: "12px",
    padding: "16px",
  },
  button: {
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    cursor: "pointer",
    background: "#38bdf8",
    color: "#0b1220",
    fontWeight: 700,
    fontSize: "16px",
  },
  secondaryButton: {
    padding: "10px 16px",
    borderRadius: "10px",
    border: "1px solid #334155",
    cursor: "pointer",
    background: "transparent",
    color: "#e2e8f0",
    fontWeight: 600,
    fontSize: "15px",
  },
  status: {
    fontSize: "14px",
    color: "#cbd5e1",
  },
  message: {
    fontSize: "14px",
    color: "#e2e8f0",
    minHeight: "20px",
  },
  footer: {
    marginTop: "12px",
    color: "#94a3b8",
  },
  overlayColumn: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  overlayLabel: {
    color: "#cbd5e1",
    fontSize: "14px",
  },
  videoShell: {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    border: "1px solid #1f2937",
    background: "#0f172a",
    minHeight: "320px",
  },
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
  statsBox: {
    display: "flex",
    gap: "12px",
    fontSize: "14px",
    color: "#cbd5e1",
  },
};

export default styles;
