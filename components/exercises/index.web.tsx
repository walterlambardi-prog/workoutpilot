import React from "react";
import { useTranslation } from "react-i18next";

import styles from "./exercises.web.styles";
import { useWebPoseDetection } from "./hooks/useWebPoseDetection";

/**
 * Web exercises screen with MediaPipe pose detection
 * Uses @mediapipe/tasks-vision for browser-based pose detection
 */
export default function ExercisesWebScreen() {
  const {
    status,
    messageKey,
    stats,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  } = useWebPoseDetection();
  const { t } = useTranslation();

  const footerItems =
    (t("exercises.web.footer", { returnObjects: true }) as string[]) ?? [];

  const startLabel =
    status === "loading"
      ? t("exercises.web.buttons.loading")
      : status === "running"
        ? t("exercises.web.buttons.processing")
        : status === "ready"
          ? t("exercises.web.buttons.start")
          : t("exercises.web.buttons.starting");

  return (
    <main style={styles.page}>
      <section style={styles.card}>
        <header style={styles.header}>
          <h1 style={styles.title}>{t("exercises.web.title")}</h1>
          <p style={styles.subtitle}>{t("exercises.web.subtitle")}</p>
        </header>

        <div style={styles.row}>
          <div style={styles.actions}>
            <button
              onClick={startCamera}
              disabled={status !== "ready"}
              style={styles.button}
              aria-label={t("exercises.web.aria.start")}
            >
              {startLabel}
            </button>
            <button
              onClick={stopCamera}
              disabled={status !== "running"}
              style={styles.secondaryButton}
              aria-label={t("exercises.web.aria.stop")}
            >
              {t("exercises.web.stop")}
            </button>
            <div style={styles.status}>
              <strong>{t("exercises.web.status")}:</strong>{" "}
              {t(`exercises.statuses.${status}`)}
            </div>
            <div style={styles.message}>
              {t(`exercises.messages.${messageKey}`)}
            </div>
            {stats && (
              <div style={styles.statsBox}>
                {typeof stats.poseCount === "number" && (
                  <div>
                    <strong>{t("exercises.web.poseCount")}:</strong>{" "}
                    {stats.poseCount}
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={styles.overlayColumn}>
            <div style={styles.overlayLabel}>
              {t("exercises.web.overlayLabel")}
            </div>
            <div style={styles.videoShell}>
              <video ref={videoRef} style={styles.video} playsInline muted />
              <canvas ref={canvasRef} style={styles.canvas} />
            </div>
          </div>
        </div>

        <footer style={styles.footer}>
          <ul>
            {footerItems.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </footer>
      </section>
    </main>
  );
}
