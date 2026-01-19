import React from "react";

import styles from "./exercises.web.styles";
import { useWebPoseDetection } from "./hooks/useWebPoseDetection";

/**
 * Web exercises screen with MediaPipe pose detection
 * Uses @mediapipe/tasks-vision for browser-based pose detection
 */
export default function ExercisesWebScreen() {
  const {
    status,
    message,
    stats,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  } = useWebPoseDetection();

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>Exercises (web)</h1>
          <p style={styles.subtitle}>
            Demo rápida con @mediapipe/tasks-vision (ImageSegmenter).
          </p>
        </header>

        <div style={styles.row}>
          <div style={styles.actions}>
            <button
              onClick={startCamera}
              disabled={status !== "ready"}
              style={styles.button}
              aria-label="Iniciar webcam"
            >
              {status === "loading"
                ? "Cargando modelo..."
                : status === "running"
                  ? "Procesando..."
                  : "Iniciar webcam"}
            </button>
            <button
              onClick={stopCamera}
              disabled={status !== "running"}
              style={styles.secondaryButton}
              aria-label="Detener webcam"
            >
              Detener
            </button>
            <div style={styles.status}>
              <strong>Status:</strong> {status}
            </div>
            <div style={styles.message}>{message}</div>
            {stats && (
              <div style={styles.statsBox}>
                {typeof stats.poseCount === "number" && (
                  <div>
                    <strong>Poses:</strong> {stats.poseCount}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.overlayColumn}>
            <div style={styles.overlayLabel}>Webcam</div>
            <div style={styles.videoShell}>
              <video ref={videoRef} style={styles.video} playsInline muted />
              <canvas ref={canvasRef} style={styles.canvas} />
            </div>
          </div>
        </div>

        <footer style={styles.footer}>
          <ul>
            <li>Modelo y WASM se sirven desde /public.</li>
            <li>Pose usa PoseLandmarker y dibuja 33 joints sobre el canvas.</li>
            <li>RequestAnimationFrame mantiene la detección en vivo.</li>
          </ul>
        </footer>
      </section>
    </main>
  );
}
