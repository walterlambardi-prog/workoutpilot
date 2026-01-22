import type { TFunction } from "i18next";
import { useCallback, useMemo, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

type LungeState = "idle" | "standing" | "descending" | "bottom" | "ascending";
type ActiveLeg = "left" | "right" | null;

interface Metrics {
  repCount: number;
  feedback?: string;
  frontKneeAngle: number;
  backKneeAngle: number;
  hipDepth: number;
  progress: number;
  activeLeg: ActiveLeg;
  state: LungeState;
}

interface LungePose {
  leftShoulder: PoseLandmark;
  rightShoulder: PoseLandmark;
  leftHip: PoseLandmark;
  rightHip: PoseLandmark;
  leftKnee: PoseLandmark;
  rightKnee: PoseLandmark;
  leftAnkle: PoseLandmark;
  rightAnkle: PoseLandmark;
}

// Configuration constants
const MIN_VISIBILITY = 0.45;
const UI_UPDATE_THROTTLE_MS = 100;
const REP_DEBOUNCE_MS = 300;

// Simplified angle thresholds - much more permissive
const TOP_THRESHOLD = 140; // Knee angle cuando está arriba (más permisivo)
const BOTTOM_THRESHOLD = 110; // Knee angle cuando baja (más permisivo)

// Tolerance for detecting which leg is active
const ANGLE_DIFF_THRESHOLD = 8;

/**
 * Calculate angle between three points
 */
const calculateAngle = (
  p1: PoseLandmark,
  p2: PoseLandmark,
  p3: PoseLandmark,
): number => {
  const radians =
    Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
};

/**
 * Extract required landmarks from pose
 */
const extractLungePose = (landmarks: PoseLandmark[]): LungePose | null => {
  if (landmarks.length < 29) return null;

  const pose: LungePose = {
    leftShoulder: landmarks[11],
    rightShoulder: landmarks[12],
    leftHip: landmarks[23],
    rightHip: landmarks[24],
    leftKnee: landmarks[25],
    rightKnee: landmarks[26],
    leftAnkle: landmarks[27],
    rightAnkle: landmarks[28],
  };

  // Validate all points exist and are visible
  const requiredPoints = Object.values(pose);
  const allVisible = requiredPoints.every(
    (point) => point && (point.visibility ?? 0) > MIN_VISIBILITY,
  );

  return allVisible ? pose : null;
};

/**
 * Determine which leg is in front (more bent)
 */
const detectActiveLeg = (
  leftKneeAngle: number,
  rightKneeAngle: number,
  currentActive: ActiveLeg,
): ActiveLeg => {
  const diff = Math.abs(leftKneeAngle - rightKneeAngle);

  // Si las rodillas están muy parejas, mantener el activo actual
  if (diff < ANGLE_DIFF_THRESHOLD) return currentActive;

  // La pierna más doblada es la activa (ángulo menor)
  return leftKneeAngle < rightKneeAngle ? "left" : "right";
};

/**
 * Calculate progress percentage based on state and angles
 */
const calculateProgress = (
  state: LungeState,
  frontKneeAngle: number,
): number => {
  if (state === "idle" || state === "standing") return 0;

  if (state === "descending" || state === "bottom") {
    // De TOP_THRESHOLD a BOTTOM_THRESHOLD = 0% a 50%
    const range = TOP_THRESHOLD - BOTTOM_THRESHOLD;
    const current = Math.max(
      0,
      Math.min(range, TOP_THRESHOLD - frontKneeAngle),
    );
    return Math.min(50, (current / range) * 50);
  }

  // ascending
  // De BOTTOM_THRESHOLD a TOP_THRESHOLD = 50% a 100%
  const range = TOP_THRESHOLD - BOTTOM_THRESHOLD;
  const current = Math.max(
    0,
    Math.min(range, frontKneeAngle - BOTTOM_THRESHOLD),
  );
  return 50 + Math.min(50, (current / range) * 50);
};

export const useLungesCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const repCountRef = useRef(0);
  const stateRef = useRef<LungeState>("idle");
  const activeLegRef = useRef<ActiveLeg>(null);

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    frontKneeAngle: 0,
    backKneeAngle: 0,
    hipDepth: 0,
    progress: 0,
    activeLeg: null,
    state: "idle",
    feedback: t("exercises.lunges.feedback.showBody"),
  });

  const reset = useCallback(() => {
    repCountRef.current = 0;
    stateRef.current = "idle";
    activeLegRef.current = null;
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    setMetrics({
      repCount: 0,
      frontKneeAngle: 0,
      backKneeAngle: 0,
      hipDepth: 0,
      progress: 0,
      activeLeg: null,
      state: "idle",
      feedback: t("exercises.lunges.feedback.showBody"),
    });
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      const now = Date.now();

      // No landmarks detected
      if (!landmarks || landmarks.length < 29) {
        const idleMetrics: Metrics = {
          repCount: repCountRef.current,
          frontKneeAngle: 0,
          backKneeAngle: 0,
          hipDepth: 0,
          progress: 0,
          activeLeg: activeLegRef.current,
          state: stateRef.current === "idle" ? "idle" : stateRef.current,
          feedback: t("exercises.lunges.feedback.noPose"),
        };
        setMetrics(idleMetrics);
        return idleMetrics;
      }

      // Extract and validate required pose landmarks
      const pose = extractLungePose(landmarks);
      if (!pose) {
        const idleMetrics: Metrics = {
          repCount: repCountRef.current,
          frontKneeAngle: 0,
          backKneeAngle: 0,
          hipDepth: 0,
          progress: 0,
          activeLeg: activeLegRef.current,
          state: stateRef.current === "idle" ? "idle" : stateRef.current,
          feedback: t("exercises.lunges.feedback.showBody"),
        };
        setMetrics(idleMetrics);
        return idleMetrics;
      }

      // Calculate knee angles
      const leftKneeAngle = calculateAngle(
        pose.leftHip,
        pose.leftKnee,
        pose.leftAnkle,
      );
      const rightKneeAngle = calculateAngle(
        pose.rightHip,
        pose.rightKnee,
        pose.rightAnkle,
      );

      // Determine active leg (more bent knee = smaller angle)
      const activeLeg = detectActiveLeg(
        leftKneeAngle,
        rightKneeAngle,
        activeLegRef.current,
      );

      // Get angles for front and back legs
      const frontKneeAngle =
        activeLeg === "left" ? leftKneeAngle : rightKneeAngle;
      const backKneeAngle =
        activeLeg === "left" ? rightKneeAngle : leftKneeAngle;

      // SIMPLIFIED STATE MACHINE
      let state = stateRef.current;
      let feedback = "";

      // START: Si estamos idle o standing, esperamos que detecte movimiento
      if (state === "idle" || state === "standing") {
        if (activeLeg && frontKneeAngle < TOP_THRESHOLD) {
          // Usuario empezó a bajar
          state = "descending";
          activeLegRef.current = activeLeg;
          feedback = t("exercises.lunges.feedback.lower", {
            leg: t(`exercises.lunges.legLabel.${activeLeg}` as const),
          });
        } else {
          state = "standing";
          feedback = t("exercises.lunges.feedback.standTall");
        }
      }

      // DESCENDING: Bajar hasta el fondo
      else if (state === "descending") {
        if (frontKneeAngle <= BOTTOM_THRESHOLD) {
          state = "bottom";
          feedback = t("exercises.lunges.feedback.bottom", {
            leg: t(
              `exercises.lunges.legLabel.${activeLegRef.current}` as const,
            ),
          });
        } else {
          feedback = t("exercises.lunges.feedback.lower", {
            leg: t(
              `exercises.lunges.legLabel.${activeLegRef.current}` as const,
            ),
          });
        }
      }

      // BOTTOM: Empezar a subir
      else if (state === "bottom") {
        if (frontKneeAngle > BOTTOM_THRESHOLD + 5) {
          state = "ascending";
          feedback = t("exercises.lunges.feedback.driveUp", {
            leg: t(
              `exercises.lunges.legLabel.${activeLegRef.current}` as const,
            ),
          });
        } else {
          feedback = t("exercises.lunges.feedback.bottom", {
            leg: t(
              `exercises.lunges.legLabel.${activeLegRef.current}` as const,
            ),
          });
        }
      }

      // ASCENDING: Subir hasta arriba y contar rep
      else if (state === "ascending") {
        if (frontKneeAngle >= TOP_THRESHOLD) {
          // REP COMPLETADA!
          if (now - lastRepTimeRef.current > REP_DEBOUNCE_MS) {
            repCountRef.current += 1;
            lastRepTimeRef.current = now;
            feedback = t("exercises.lunges.feedback.complete", {
              leg: t(
                `exercises.lunges.legLabel.${activeLegRef.current}` as const,
              ),
            });
          }
          state = "standing";
          activeLegRef.current = null; // Reset para próxima rep
        } else {
          feedback = t("exercises.lunges.feedback.driveUp", {
            leg: t(
              `exercises.lunges.legLabel.${activeLegRef.current}` as const,
            ),
          });
        }
      }

      // Update state
      stateRef.current = state;

      // Calculate progress
      const progress = calculateProgress(state, frontKneeAngle);

      const nextMetrics: Metrics = {
        repCount: repCountRef.current,
        frontKneeAngle: Math.round(frontKneeAngle),
        backKneeAngle: Math.round(backKneeAngle),
        hipDepth: 0, // No longer used
        progress: Math.round(progress),
        activeLeg: activeLegRef.current,
        state,
        feedback,
      };

      // Throttle UI updates
      const shouldUpdateUi =
        now - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS;
      if (shouldUpdateUi) {
        lastUiUpdateRef.current = now;
      }

      setMetrics(nextMetrics);
      return nextMetrics;
    },
    [t],
  );

  const statItems = useMemo(
    () => [
      {
        label: t("exercises.lunges.labels.activeLeg"),
        value:
          metrics.activeLeg === "left"
            ? t("exercises.lunges.legLabel.left")
            : metrics.activeLeg === "right"
              ? t("exercises.lunges.legLabel.right")
              : t("exercises.lunges.legLabel.none"),
      },
      {
        label: t("exercises.lunges.labels.frontKnee"),
        value: `${metrics.frontKneeAngle}°`,
      },
      {
        label: t("exercises.lunges.labels.backKnee"),
        value: `${metrics.backKneeAngle}°`,
      },
    ],
    [metrics.activeLeg, metrics.frontKneeAngle, metrics.backKneeAngle, t],
  );

  return {
    metrics,
    processLandmarks,
    reset,
    statItems,
  };
};
