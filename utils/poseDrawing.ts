import type { PoseLandmark } from "@/components/exercises/exercises.types";
import { POSE_CONNECTIONS } from "@/constants/exercises";

interface DrawPoseOptions {
  canvas: HTMLCanvasElement;
  landmarks: PoseLandmark[];
  strokeColor?: string;
  fillColor?: string;
  lineWidth?: number;
  pointRadius?: number;
}

/**
 * Draws pose landmarks and connections on a canvas
 * @param options - Drawing configuration including canvas, landmarks, and styling
 */
export const drawPoseLandmarks = ({
  canvas,
  landmarks,
  strokeColor = "#38bdf8",
  fillColor = "#f472b6",
  lineWidth = 3,
  pointRadius = 4,
}: DrawPoseOptions): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const project = (lm: PoseLandmark) => ({
    x: lm.x * canvas.width,
    y: lm.y * canvas.height,
  });

  // Draw connections
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = lineWidth;

  POSE_CONNECTIONS.forEach(([a, b]) => {
    const p1 = project(landmarks[a]);
    const p2 = project(landmarks[b]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
  });

  // Draw landmarks
  ctx.fillStyle = fillColor;
  landmarks.forEach((lm) => {
    const { x, y } = project(lm);
    ctx.beginPath();
    ctx.arc(x, y, pointRadius, 0, Math.PI * 2);
    ctx.fill();
  });
};
