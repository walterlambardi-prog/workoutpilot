import { POSE_CONNECTIONS } from "@/components/exercises/exercises.constants";
import type { PoseLandmark } from "@/components/exercises/exercises.types";

interface DrawPoseOptions {
  canvas: HTMLCanvasElement;
  landmarks: PoseLandmark[];
  strokeColor?: string;
  fillColor?: string;
  lineWidth?: number;
  pointRadius?: number;
  sourceWidth?: number;
  sourceHeight?: number;
  targetWidth?: number;
  targetHeight?: number;
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
  sourceWidth,
  sourceHeight,
  targetWidth,
  targetHeight,
}: DrawPoseOptions): void => {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const targetW = targetWidth ?? canvas.width;
  const targetH = targetHeight ?? canvas.height;
  const sourceW = sourceWidth ?? targetW;
  const sourceH = sourceHeight ?? targetH;
  const scale = Math.max(targetW / sourceW, targetH / sourceH);
  const offsetX = (sourceW * scale - targetW) / 2;
  const offsetY = (sourceH * scale - targetH) / 2;

  const project = (lm: PoseLandmark) => ({
    x: lm.x * sourceW * scale - offsetX,
    y: lm.y * sourceH * scale - offsetY,
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
