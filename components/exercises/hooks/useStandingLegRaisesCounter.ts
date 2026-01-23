import type { TFunction } from "i18next";
import { useCallback, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

type LegRaiseState = "down" | "raising" | "up" | "lowering";
type ActiveLeg = "left" | "right" | null;

interface Metrics {
  repCount: number;
  leftReps: number;
  rightReps: number;
  feedback?: string;
  hipAngle: number;
  progress: number;
  activeLeg: ActiveLeg;
  state: LegRaiseState;
}

// Configuration constants
const MIN_VISIBILITY = 0.5;
const UI_UPDATE_THROTTLE_MS = 100;
const REP_DEBOUNCE_MS = 300;

// Angle thresholds for leg raise detection
const ANGLE_DOWN = 175; // Hip angle when leg is down (nearly straight)
const ANGLE_UP = 135; // Hip angle when leg is raised to the side
const ANGLE_TRANSITION = 155; // Threshold to detect state changes

// Minimum angle difference to detect which leg is active
const ANGLE_DIFF_THRESHOLD = 12;

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
 * Extract required landmarks for leg raises
 */
const extractLegRaisePose = (landmarks: PoseLandmark[]) => {
  if (landmarks.length < 29) return null;

  const pose = {
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
 * Determine which leg is being raised (the one with smaller hip-knee-ankle angle)
 */
const detectActiveLeg = (
  leftHipAngle: number,
  rightHipAngle: number,
  currentActive: ActiveLeg,
): ActiveLeg => {
  const diff = Math.abs(leftHipAngle - rightHipAngle);

  // If angles are similar, keep current active leg
  if (diff < ANGLE_DIFF_THRESHOLD) return currentActive;

  // The leg with smaller angle is being raised (more bent from vertical)
  return leftHipAngle < rightHipAngle ? "left" : "right";
};

/**
 * Calculate progress percentage based on hip angle
 */
const calculateProgress = (state: LegRaiseState, hipAngle: number): number => {
  if (state === "down") return 0;

  if (state === "raising" || state === "up") {
    // From ANGLE_DOWN to ANGLE_UP = 0% to 50%
    const range = ANGLE_DOWN - ANGLE_UP;
    const current = Math.max(0, Math.min(range, ANGLE_DOWN - hipAngle));
    return Math.min(50, (current / range) * 50);
  }

  // lowering: from ANGLE_UP to ANGLE_DOWN = 50% to 100%
  const range = ANGLE_DOWN - ANGLE_UP;
  const current = Math.max(0, Math.min(range, hipAngle - ANGLE_UP));
  return 50 + Math.min(50, (current / range) * 50);
};

export const useStandingLegRaisesCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const leftRepsRef = useRef(0);
  const rightRepsRef = useRef(0);
  const stateRef = useRef<LegRaiseState>("down");
  const activeLegRef = useRef<ActiveLeg>(null);

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    leftReps: 0,
    rightReps: 0,
    hipAngle: 0,
    progress: 0,
    activeLeg: null,
    state: "down",
    feedback: t("exercises.standingLegRaises.feedback.showBody"),
  });

  const reset = useCallback(() => {
    leftRepsRef.current = 0;
    rightRepsRef.current = 0;
    stateRef.current = "down";
    activeLegRef.current = null;
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    setMetrics({
      repCount: 0,
      leftReps: 0,
      rightReps: 0,
      hipAngle: 0,
      progress: 0,
      activeLeg: null,
      state: "down",
      feedback: t("exercises.standingLegRaises.feedback.showBody"),
    });
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      if (!landmarks || landmarks.length < 29) {
        setMetrics((prev) => ({
          ...prev,
          feedback: t("exercises.standingLegRaises.feedback.noPose"),
          progress: 0,
        }));
        return {
          ...metrics,
          feedback: t("exercises.standingLegRaises.feedback.noPose"),
          progress: 0,
        } as Metrics;
      }

      const pose = extractLegRaisePose(landmarks);

      if (!pose) {
        const next = {
          ...metrics,
          feedback: t("exercises.standingLegRaises.feedback.improveLight"),
        };
        setMetrics(next);
        return next;
      }

      // Calculate hip angles for both legs
      // Hip angle = angle between shoulder, hip, and knee
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

      // Detect which leg is active
      const currentActiveLeg = activeLegRef.current;
      const newActiveLeg = detectActiveLeg(
        leftHipAngle,
        rightHipAngle,
        currentActiveLeg,
      );
      activeLegRef.current = newActiveLeg;

      // Get the active leg's hip angle
      const activeHipAngle =
        newActiveLeg === "left" ? leftHipAngle : rightHipAngle;

      const now = Date.now();
      const currentState = stateRef.current;
      let nextState = currentState;
      let feedback = metrics.feedback;

      // State machine for leg raise detection
      if (currentState === "down") {
        if (activeHipAngle < ANGLE_TRANSITION && newActiveLeg) {
          nextState = "raising";
          feedback = t(
            `exercises.standingLegRaises.feedback.raise${newActiveLeg === "left" ? "Left" : "Right"}`,
          );
        } else {
          feedback = t("exercises.standingLegRaises.feedback.standStraight");
        }
      } else if (currentState === "raising") {
        if (activeHipAngle < ANGLE_UP) {
          nextState = "up";
          feedback = t("exercises.standingLegRaises.feedback.holdUp");
        } else {
          feedback = t(
            `exercises.standingLegRaises.feedback.raise${newActiveLeg === "left" ? "Left" : "Right"}`,
          );
        }
      } else if (currentState === "up") {
        if (activeHipAngle > ANGLE_TRANSITION) {
          nextState = "lowering";
          feedback = t("exercises.standingLegRaises.feedback.lower");
        }
      } else if (currentState === "lowering") {
        if (activeHipAngle > ANGLE_DOWN - 5) {
          // Rep completed
          if (now - lastRepTimeRef.current > REP_DEBOUNCE_MS && newActiveLeg) {
            if (newActiveLeg === "left") {
              leftRepsRef.current += 1;
            } else {
              rightRepsRef.current += 1;
            }
            lastRepTimeRef.current = now;

            const legLabel = t(
              `exercises.standingLegRaises.legLabel.${newActiveLeg}`,
            );
            feedback = t("exercises.standingLegRaises.feedback.complete", {
              leg: legLabel,
            });
          }
          nextState = "down";
        } else {
          feedback = t("exercises.standingLegRaises.feedback.lower");
        }
      }

      stateRef.current = nextState;

      const totalReps = leftRepsRef.current + rightRepsRef.current;
      const progress = calculateProgress(nextState, activeHipAngle);

      // Throttle UI updates
      if (now - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS) {
        lastUiUpdateRef.current = now;

        const nextMetrics: Metrics = {
          repCount: totalReps,
          leftReps: leftRepsRef.current,
          rightReps: rightRepsRef.current,
          hipAngle: Math.round(activeHipAngle),
          progress,
          activeLeg: newActiveLeg,
          state: nextState,
          feedback,
        };

        setMetrics(nextMetrics);
        return nextMetrics;
      }

      return {
        repCount: totalReps,
        leftReps: leftRepsRef.current,
        rightReps: rightRepsRef.current,
        hipAngle: Math.round(activeHipAngle),
        progress,
        activeLeg: newActiveLeg,
        state: nextState,
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
    state: metrics.state,
    activeLeg: metrics.activeLeg,
  };
};
