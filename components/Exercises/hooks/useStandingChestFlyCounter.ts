import type { TFunction } from "i18next";
import { useCallback, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

type ChestFlyState = "open" | "closing" | "closed" | "opening";

interface Metrics {
  repCount: number;
  feedback?: string;
  leftElbowAngle: number;
  rightElbowAngle: number;
  progress: number;
}

// Configuration constants
const MIN_VISIBILITY = 0.5;
const UI_UPDATE_THROTTLE_MS = 100;
const REP_DEBOUNCE_MS = 400;

// Elbow angle thresholds (should stay bent around 90°)
const ELBOW_MIN_ANGLE = 45; // Minimum bend (muy permisivo: permite brazos casi rectos)
const ELBOW_MAX_ANGLE = 135; // Maximum bend (muy permisivo: permite mucha flexión)

// Wrist distance thresholds (horizontal distance between wrists)
const DISTANCE_OPEN = 0.3; // Wrists far apart (menos exigente: 0.35 → 0.30)
const DISTANCE_CLOSED = 0.18; // Wrists close together (menos exigente: 0.15 → 0.18)
const DISTANCE_TRANSITION = 0.24; // Threshold for state changes

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
 * Calculate horizontal distance between two points (normalized)
 */
const calculateDistance = (p1: PoseLandmark, p2: PoseLandmark): number => {
  return Math.abs(p1.x - p2.x);
};

/**
 * Extract required landmarks for chest fly
 */
const extractChestFlyPose = (landmarks: PoseLandmark[]) => {
  if (landmarks.length < 17) return null;

  const pose = {
    leftShoulder: landmarks[11],
    rightShoulder: landmarks[12],
    leftElbow: landmarks[13],
    rightElbow: landmarks[14],
    leftWrist: landmarks[15],
    rightWrist: landmarks[16],
    leftHip: landmarks[23],
    rightHip: landmarks[24],
  };

  // Validate all points exist and are visible
  const requiredPoints = Object.values(pose);
  const allVisible = requiredPoints.every(
    (point) => point && (point.visibility ?? 0) > MIN_VISIBILITY,
  );

  return allVisible ? pose : null;
};

/**
 * Calculate progress percentage based on wrist distance
 */
const calculateProgress = (
  state: ChestFlyState,
  wristDistance: number,
): number => {
  if (state === "open") return 0;

  if (state === "closing" || state === "closed") {
    // From DISTANCE_OPEN to DISTANCE_CLOSED = 0% to 50%
    const range = DISTANCE_OPEN - DISTANCE_CLOSED;
    const current = Math.max(0, Math.min(range, DISTANCE_OPEN - wristDistance));
    return Math.min(50, (current / range) * 50);
  }

  // opening: from DISTANCE_CLOSED to DISTANCE_OPEN = 50% to 100%
  const range = DISTANCE_OPEN - DISTANCE_CLOSED;
  const current = Math.max(0, Math.min(range, wristDistance - DISTANCE_CLOSED));
  return 50 + Math.min(50, (current / range) * 50);
};

/**
 * Check if user is standing upright (shoulders above hips)
 */
const isStandingUpright = (
  shoulder: PoseLandmark,
  hip: PoseLandmark,
): boolean => {
  return shoulder.y < hip.y + 0.05;
};

/**
 * Check if elbows are properly bent (around 90°)
 */
const areElbowsBent = (leftAngle: number, rightAngle: number): boolean => {
  return (
    leftAngle >= ELBOW_MIN_ANGLE &&
    leftAngle <= ELBOW_MAX_ANGLE &&
    rightAngle >= ELBOW_MIN_ANGLE &&
    rightAngle <= ELBOW_MAX_ANGLE
  );
};

export const useStandingChestFlyCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const repCountRef = useRef(0);
  const stateRef = useRef<ChestFlyState>("open");

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    leftElbowAngle: 0,
    rightElbowAngle: 0,
    progress: 0,
    feedback: t("exercises.standingChestFly.feedback.showBody"),
  });

  const reset = useCallback(() => {
    repCountRef.current = 0;
    stateRef.current = "open";
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    setMetrics({
      repCount: 0,
      leftElbowAngle: 0,
      rightElbowAngle: 0,
      progress: 0,
      feedback: t("exercises.standingChestFly.feedback.showBody"),
    });
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      if (!landmarks || landmarks.length < 17) {
        setMetrics((prev) => ({
          ...prev,
          feedback: t("exercises.standingChestFly.feedback.noPose"),
          progress: 0,
        }));
        return {
          ...metrics,
          feedback: t("exercises.standingChestFly.feedback.noPose"),
          progress: 0,
        } as Metrics;
      }

      const pose = extractChestFlyPose(landmarks);

      if (!pose) {
        const next = {
          ...metrics,
          feedback: t("exercises.standingChestFly.feedback.improveLight"),
        };
        setMetrics(next);
        return next;
      }

      // Calculate elbow angles (shoulder-elbow-wrist)
      const leftElbowAngle = calculateAngle(
        pose.leftShoulder,
        pose.leftElbow,
        pose.leftWrist,
      );
      const rightElbowAngle = calculateAngle(
        pose.rightShoulder,
        pose.rightElbow,
        pose.rightWrist,
      );

      // Calculate horizontal distance between wrists
      const wristDistance = calculateDistance(pose.leftWrist, pose.rightWrist);

      // Check if user is standing upright
      const leftUpright = isStandingUpright(pose.leftShoulder, pose.leftHip);
      const rightUpright = isStandingUpright(pose.rightShoulder, pose.rightHip);

      if (!leftUpright || !rightUpright) {
        const next = {
          ...metrics,
          leftElbowAngle: Math.round(leftElbowAngle),
          rightElbowAngle: Math.round(rightElbowAngle),
          feedback: t("exercises.standingChestFly.feedback.standUpright"),
        };
        setMetrics(next);
        return next;
      }

      // Check if elbows are properly bent (solo advertencia, no bloquea el ejercicio)
      const elbowsBentProperly = areElbowsBent(leftElbowAngle, rightElbowAngle);

      const now = Date.now();
      const currentState = stateRef.current;
      let nextState = currentState;
      let feedback = metrics.feedback;

      // State machine for chest fly detection
      if (currentState === "open") {
        // Arms open, ready to bring together
        if (wristDistance < DISTANCE_TRANSITION) {
          nextState = "closing";
          feedback = t("exercises.standingChestFly.feedback.bringTogether");
        } else {
          // Agregar advertencia sobre codos solo si están muy fuera del rango
          if (!elbowsBentProperly) {
            feedback = t("exercises.standingChestFly.feedback.keepElbowsBent");
          } else {
            feedback = t("exercises.standingChestFly.feedback.standReady");
          }
        }
      } else if (currentState === "closing") {
        // Bringing arms together
        if (wristDistance < DISTANCE_CLOSED + 0.05) {
          nextState = "closed";
          feedback = t("exercises.standingChestFly.feedback.holdCenter");
        } else if (wristDistance > DISTANCE_TRANSITION) {
          // User opened arms before reaching center
          nextState = "open";
          feedback = t("exercises.standingChestFly.feedback.bringTogether");
        } else {
          feedback = t("exercises.standingChestFly.feedback.bringTogether");
        }
      } else if (currentState === "closed") {
        // Arms at center, ready to open
        if (wristDistance > DISTANCE_TRANSITION) {
          nextState = "opening";
          feedback = t("exercises.standingChestFly.feedback.openArms");
        }
      } else if (currentState === "opening") {
        // Opening arms back to start
        if (wristDistance > DISTANCE_OPEN - 0.05) {
          // Rep completed
          if (now - lastRepTimeRef.current > REP_DEBOUNCE_MS) {
            repCountRef.current += 1;
            lastRepTimeRef.current = now;
            feedback = t("exercises.standingChestFly.feedback.complete");
          }
          nextState = "open";
        } else if (wristDistance < DISTANCE_TRANSITION) {
          // User closed arms again before fully opening
          nextState = "closed";
          feedback = t("exercises.standingChestFly.feedback.openArms");
        } else {
          feedback = t("exercises.standingChestFly.feedback.openArms");
        }
      }

      stateRef.current = nextState;

      const progress = calculateProgress(nextState, wristDistance);

      // Throttle UI updates
      if (now - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS) {
        lastUiUpdateRef.current = now;

        const nextMetrics: Metrics = {
          repCount: repCountRef.current,
          leftElbowAngle: Math.round(leftElbowAngle),
          rightElbowAngle: Math.round(rightElbowAngle),
          progress,
          feedback,
        };

        setMetrics(nextMetrics);
        return nextMetrics;
      }

      return {
        repCount: repCountRef.current,
        leftElbowAngle: Math.round(leftElbowAngle),
        rightElbowAngle: Math.round(rightElbowAngle),
        progress,
        feedback,
      };
    },
    [t, metrics],
  );

  return {
    processLandmarks,
    reset,
    repCount: metrics.repCount,
    feedback: metrics.feedback,
  };
};
