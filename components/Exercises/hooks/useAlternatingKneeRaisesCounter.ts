import type { TFunction } from "i18next";
import { useCallback, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

type Leg = "left" | "right";
type LegState = "down" | "up";

interface Metrics {
  repCount: number;
  leftReps: number;
  rightReps: number;
  feedback?: string;
  leftHipAngle: number;
  rightHipAngle: number;
  progress: number;
}

// Configuration constants
const MIN_VISIBILITY = 0.5;
const UI_UPDATE_THROTTLE_MS = 100;
const REP_DEBOUNCE_MS = 300;

// Angle thresholds for knee raise detection (measuring hip flexion angle)
const ANGLE_DOWN = 165; // Hip angle when leg is down (nearly straight)
const ANGLE_UP = 70; // Hip angle when knee is raised to chest (tight angle)

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
 * Extract required landmarks for knee raises
 */
const extractKneeRaisePose = (landmarks: PoseLandmark[]) => {
  if (landmarks.length < 29) return null;

  const pose = {
    leftShoulder: landmarks[11],
    rightShoulder: landmarks[12],
    leftHip: landmarks[23],
    rightHip: landmarks[24],
    leftKnee: landmarks[25],
    rightKnee: landmarks[26],
  };

  // Validate all points exist and are visible
  const requiredPoints = Object.values(pose);
  const allVisible = requiredPoints.every(
    (point) => point && (point.visibility ?? 0) > MIN_VISIBILITY,
  );

  return allVisible ? pose : null;
};

/**
 * Calculate progress percentage based on hip flexion angle
 */
const calculateProgress = (angle: number): number => {
  const range = ANGLE_DOWN - ANGLE_UP;
  const current = Math.max(0, Math.min(range, ANGLE_DOWN - angle));
  return Math.min(100, (current / range) * 100);
};

/**
 * Check if user is standing upright (shoulders above hips)
 */
const isStandingUpright = (
  shoulder: PoseLandmark,
  hip: PoseLandmark,
): boolean => {
  // Shoulder should be above hip (lower Y value)
  return shoulder.y < hip.y + 0.05; // Allow slight lean
};

/**
 * Classify leg state based on hip angle
 */
const classifyState = (angle: number): LegState => {
  if (angle < ANGLE_UP + 10) return "up";
  return "down";
};

/**
 * Check if the other leg is down enough (extended)
 */
const otherLegDownEnough = (
  leg: Leg,
  leftAngle: number,
  rightAngle: number,
): boolean => {
  return leg === "left"
    ? rightAngle > ANGLE_DOWN - 10
    : leftAngle > ANGLE_DOWN - 10;
};

export const useAlternatingKneeRaisesCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const leftRepsRef = useRef(0);
  const rightRepsRef = useRef(0);
  const lastLegRef = useRef<Leg | null>(null);

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    leftReps: 0,
    rightReps: 0,
    leftHipAngle: 0,
    rightHipAngle: 0,
    progress: 0,
    feedback: t("exercises.alternatingKneeRaises.feedback.showBody"),
  });

  const reset = useCallback(() => {
    leftRepsRef.current = 0;
    rightRepsRef.current = 0;
    lastLegRef.current = null;
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    setMetrics({
      repCount: 0,
      leftReps: 0,
      rightReps: 0,
      leftHipAngle: 0,
      rightHipAngle: 0,
      progress: 0,
      feedback: t("exercises.alternatingKneeRaises.feedback.showBody"),
    });
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      if (!landmarks || landmarks.length < 29) {
        setMetrics((prev) => ({
          ...prev,
          feedback: t("exercises.alternatingKneeRaises.feedback.noPose"),
          progress: 0,
        }));
        return {
          ...metrics,
          feedback: t("exercises.alternatingKneeRaises.feedback.noPose"),
          progress: 0,
        } as Metrics;
      }

      const pose = extractKneeRaisePose(landmarks);

      if (!pose) {
        const next = {
          ...metrics,
          feedback: t("exercises.alternatingKneeRaises.feedback.improveLight"),
        };
        setMetrics(next);
        return next;
      }

      // Calculate hip flexion angles for both legs (shoulder-hip-knee)
      const leftHipAngle = calculateAngle(
        pose.leftShoulder,
        pose.leftHip,
        pose.leftKnee,
      );
      const rightHipAngle = calculateAngle(
        pose.rightShoulder,
        pose.rightHip,
        pose.rightKnee,
      );

      // Check if user is standing upright
      const leftUpright = isStandingUpright(pose.leftShoulder, pose.leftHip);
      const rightUpright = isStandingUpright(pose.rightShoulder, pose.rightHip);

      if (!leftUpright || !rightUpright) {
        const next = {
          ...metrics,
          feedback: t("exercises.alternatingKneeRaises.feedback.standUpright"),
        };
        setMetrics(next);
        return next;
      }

      const leftState = classifyState(leftHipAngle);
      const rightState = classifyState(rightHipAngle);

      let feedback = t("exercises.alternatingKneeRaises.feedback.standReady");
      let progress = metrics.progress;
      let repCount = metrics.repCount;

      // Try to count a rep for each leg
      const tryCount = (leg: Leg, angle: number, state: LegState) => {
        if (state !== "up") return;
        if (!otherLegDownEnough(leg, leftHipAngle, rightHipAngle)) return;
        if (lastLegRef.current && lastLegRef.current === leg) return;

        const nowTime = Date.now();
        if (nowTime - lastRepTimeRef.current < REP_DEBOUNCE_MS) return;

        lastRepTimeRef.current = nowTime;
        lastLegRef.current = leg;

        if (leg === "left") {
          leftRepsRef.current += 1;
        } else {
          rightRepsRef.current += 1;
        }

        repCount = leftRepsRef.current + rightRepsRef.current;
        progress = calculateProgress(angle);
        feedback = t("exercises.alternatingKneeRaises.feedback.complete", {
          leg: t(`exercises.alternatingKneeRaises.legLabel.${leg}` as const),
        });
      };

      tryCount("left", leftHipAngle, leftState);
      tryCount("right", rightHipAngle, rightState);

      // Both legs down - ready to start
      if (leftState === "down" && rightState === "down") {
        feedback = t("exercises.alternatingKneeRaises.feedback.standReady");
        progress = 0;
      }

      // Provide feedback based on which leg is raising
      if (leftState === "up") {
        if (otherLegDownEnough("left", leftHipAngle, rightHipAngle)) {
          progress = calculateProgress(leftHipAngle);
          feedback = t("exercises.alternatingKneeRaises.feedback.holdUp");
        } else {
          feedback = t("exercises.alternatingKneeRaises.feedback.oneAtTime");
        }
      } else if (rightState === "up") {
        if (otherLegDownEnough("right", leftHipAngle, rightHipAngle)) {
          progress = calculateProgress(rightHipAngle);
          feedback = t("exercises.alternatingKneeRaises.feedback.holdUp");
        } else {
          feedback = t("exercises.alternatingKneeRaises.feedback.oneAtTime");
        }
      }

      const now = Date.now();

      // Throttle UI updates
      if (now - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS) {
        lastUiUpdateRef.current = now;

        const nextMetrics: Metrics = {
          repCount,
          leftReps: leftRepsRef.current,
          rightReps: rightRepsRef.current,
          leftHipAngle: Math.round(leftHipAngle),
          rightHipAngle: Math.round(rightHipAngle),
          progress,
          feedback,
        };

        setMetrics(nextMetrics);
        return nextMetrics;
      }

      return {
        repCount,
        leftReps: leftRepsRef.current,
        rightReps: rightRepsRef.current,
        leftHipAngle: Math.round(leftHipAngle),
        rightHipAngle: Math.round(rightHipAngle),
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
    leftReps: metrics.leftReps,
    rightReps: metrics.rightReps,
    feedback: metrics.feedback,
  };
};
