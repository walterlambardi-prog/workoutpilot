import type { TFunction } from "i18next";
import { useCallback, useMemo, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

type CalfRaiseState = "idle" | "bottom" | "raising" | "top" | "lowering";

interface Metrics {
  repCount: number;
  feedback?: string;
  heelElevation: number;
  progress: number;
  state: CalfRaiseState;
}

interface CalfRaisePose {
  leftShoulder: PoseLandmark;
  rightShoulder: PoseLandmark;
  leftHip: PoseLandmark;
  rightHip: PoseLandmark;
  leftKnee: PoseLandmark;
  rightKnee: PoseLandmark;
  leftAnkle: PoseLandmark;
  rightAnkle: PoseLandmark;
  leftHeel: PoseLandmark;
  rightHeel: PoseLandmark;
  leftFootIndex: PoseLandmark;
  rightFootIndex: PoseLandmark;
}

interface FormValidation {
  isValid: boolean;
  feedback?: string;
}

// Configuration constants
const MIN_VISIBILITY = 0.45;
const UI_UPDATE_THROTTLE_MS = 100;
const REP_DEBOUNCE_MS = 250;

// Thresholds based on heel elevation (distance from heel to foot index)
// When heels raise, this distance increases
const RAISED_THRESHOLD = 0.04; // 4% distance = heels raised
const LOWERED_THRESHOLD = 0.02; // 2% distance = heels down
const MID_THRESHOLD = 0.03; // 3% = intermediate zone

// Debugging
const DEBUG_LOGGING = true; // Set to false to disable console logs

// Form validation thresholds (TEMPORARILY DISABLED FOR DEBUGGING)
const ENABLE_FORM_VALIDATION = false; // Set to true once basic detection works
const FOOT_INDEX_STABILITY_THRESHOLD = 0.03; // 3% max movement in foot index Y
const KNEE_COLLAPSE_THRESHOLD = 0.15; // 15% change in knee width = collapse
const SHOULDER_TILT_THRESHOLD = 0.05; // 5% tilt = unstable shoulders
const HIP_TILT_THRESHOLD = 0.05; // 5% tilt = unstable hips

/**
 * Extract required landmarks for calf raises (front view)
 */
const extractCalfRaisePose = (
  landmarks: PoseLandmark[],
): CalfRaisePose | null => {
  if (landmarks.length < 33) return null;

  const pose: CalfRaisePose = {
    leftShoulder: landmarks[11],
    rightShoulder: landmarks[12],
    leftHip: landmarks[23],
    rightHip: landmarks[24],
    leftKnee: landmarks[25],
    rightKnee: landmarks[26],
    leftAnkle: landmarks[27],
    rightAnkle: landmarks[28],
    leftHeel: landmarks[29],
    rightHeel: landmarks[30],
    leftFootIndex: landmarks[31],
    rightFootIndex: landmarks[32],
  };

  // Validate all points exist and are visible
  const requiredPoints = Object.values(pose);
  const allVisible = requiredPoints.every(
    (point) => point && (point.visibility ?? 0) > MIN_VISIBILITY,
  );

  return allVisible ? pose : null;
};

/**
 * Calculate Euclidean distance between two landmarks
 */
const calculateDistance = (
  point1: PoseLandmark,
  point2: PoseLandmark,
): number => {
  const dx = point1.x - point2.x;
  const dy = point1.y - point2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

/**
 * Calculate heel elevation by measuring vertical distance from heel to foot index
 * When heels raise (calf raise), this distance INCREASES
 * When heels lower (flat foot), this distance DECREASES
 */
const calculateHeelElevation = (pose: CalfRaisePose): number => {
  // Calculate vertical distance for each foot
  const leftDistance = Math.abs(pose.leftHeel.y - pose.leftFootIndex.y);
  const rightDistance = Math.abs(pose.rightHeel.y - pose.rightFootIndex.y);

  // Return average
  return (leftDistance + rightDistance) / 2;
};

/**
 * Validate exercise form
 */
const validateForm = (
  pose: CalfRaisePose,
  baselineFootIndexY: number | null,
  baselineKneeWidth: number | null,
  t: TFunction,
): FormValidation => {
  // 1. Check foot index stability (should stay on ground)
  const avgFootIndexY = (pose.leftFootIndex.y + pose.rightFootIndex.y) / 2;
  if (baselineFootIndexY !== null) {
    const footMovement = Math.abs(avgFootIndexY - baselineFootIndexY);
    if (footMovement > FOOT_INDEX_STABILITY_THRESHOLD) {
      return {
        isValid: false,
        feedback: t("exercises.calfRaises.feedback.keepFeetFlat"),
      };
    }
  }

  // 2. Check for knee collapse (knees shouldn't cave inward)
  const currentKneeWidth = calculateDistance(pose.leftKnee, pose.rightKnee);
  if (baselineKneeWidth !== null) {
    const kneeWidthChange = Math.abs(currentKneeWidth - baselineKneeWidth);
    const kneeChangePercent = kneeWidthChange / baselineKneeWidth;
    if (kneeChangePercent > KNEE_COLLAPSE_THRESHOLD) {
      return {
        isValid: false,
        feedback: t("exercises.calfRaises.feedback.kneesStable"),
      };
    }
  }

  // 3. Check torso stability - shoulders level (allow vertical movement)
  const shoulderTilt = Math.abs(pose.leftShoulder.y - pose.rightShoulder.y);
  if (shoulderTilt > SHOULDER_TILT_THRESHOLD) {
    return {
      isValid: false,
      feedback: t("exercises.calfRaises.feedback.shouldersLevel"),
    };
  }

  // 4. Check torso stability - hips level (allow vertical movement)
  const hipTilt = Math.abs(pose.leftHip.y - pose.rightHip.y);
  if (hipTilt > HIP_TILT_THRESHOLD) {
    return {
      isValid: false,
      feedback: t("exercises.calfRaises.feedback.hipsLevel"),
    };
  }

  return { isValid: true };
};

/**
 * Calculate progress percentage based on state
 */
const calculateProgress = (state: CalfRaiseState): number => {
  switch (state) {
    case "idle":
    case "bottom":
      return 0;
    case "raising":
      return 25;
    case "top":
      return 50;
    case "lowering":
      return 75;
    default:
      return 0;
  }
};

export const useCalfRaisesCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const repCountRef = useRef(0);
  const stateRef = useRef<CalfRaiseState>("idle");

  // Baseline values for form validation
  const baselineFootIndexYRef = useRef<number | null>(null);
  const baselineKneeWidthRef = useRef<number | null>(null);

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    heelElevation: 0,
    progress: 0,
    state: "idle",
    feedback: t("exercises.calfRaises.feedback.showBody"),
  });

  const reset = useCallback(() => {
    repCountRef.current = 0;
    stateRef.current = "idle";
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    baselineFootIndexYRef.current = null;
    baselineKneeWidthRef.current = null;
    setMetrics({
      repCount: 0,
      heelElevation: 0,
      progress: 0,
      state: "idle",
      feedback: t("exercises.calfRaises.feedback.showBody"),
    });
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      const now = Date.now();

      // No landmarks detected
      if (!landmarks || landmarks.length < 31) {
        const idleMetrics: Metrics = {
          repCount: repCountRef.current,
          heelElevation: 0,
          progress: 0,
          state: stateRef.current === "idle" ? "idle" : stateRef.current,
          feedback: t("exercises.calfRaises.feedback.noPose"),
        };
        setMetrics(idleMetrics);
        return idleMetrics;
      }

      // Extract and validate required pose landmarks
      const pose = extractCalfRaisePose(landmarks);
      if (!pose) {
        const idleMetrics: Metrics = {
          repCount: repCountRef.current,
          heelElevation: 0,
          progress: 0,
          state: stateRef.current === "idle" ? "idle" : stateRef.current,
          feedback: t("exercises.calfRaises.feedback.showBody"),
        };
        setMetrics(idleMetrics);
        return idleMetrics;
      }

      // Initialize baselines on first valid frame
      if (baselineFootIndexYRef.current === null) {
        baselineFootIndexYRef.current =
          (pose.leftFootIndex.y + pose.rightFootIndex.y) / 2;
      }
      if (baselineKneeWidthRef.current === null) {
        baselineKneeWidthRef.current = calculateDistance(
          pose.leftKnee,
          pose.rightKnee,
        );
      }

      // Validate form first (only if enabled)
      if (ENABLE_FORM_VALIDATION) {
        const formValidation = validateForm(
          pose,
          baselineFootIndexYRef.current,
          baselineKneeWidthRef.current,
          t,
        );

        // If form is invalid, show feedback but don't count rep
        if (!formValidation.isValid && formValidation.feedback) {
          const formMetrics: Metrics = {
            repCount: repCountRef.current,
            heelElevation: 0,
            progress: 0,
            state: stateRef.current,
            feedback: formValidation.feedback,
          };
          setMetrics(formMetrics);
          return formMetrics;
        }
      }

      // Calculate heel elevation (distance from heel to foot index)
      const heelElevation = calculateHeelElevation(pose);

      // Debug logging
      if (DEBUG_LOGGING && now - lastUiUpdateRef.current > 500) {
        console.log(
          `[CalfRaises] elevation: ${(heelElevation * 100).toFixed(1)}% | state: ${stateRef.current} | raised: ${heelElevation > RAISED_THRESHOLD} | lowered: ${heelElevation < LOWERED_THRESHOLD}`,
        );
      }

      // State machine with hysteresis
      let state = stateRef.current;
      let feedback = "";

      switch (state) {
        case "idle":
        case "bottom":
          // Need to be clearly raised to start
          if (heelElevation > RAISED_THRESHOLD) {
            state = "raising";
            feedback = t("exercises.calfRaises.feedback.raise");
          } else {
            state = "bottom";
            feedback = t("exercises.calfRaises.feedback.heelsDown");
          }
          break;

        case "raising":
          // Once raised, go to top and stay there
          if (heelElevation > RAISED_THRESHOLD) {
            state = "top";
            feedback = t("exercises.calfRaises.feedback.holdTop");
          } else if (heelElevation < LOWERED_THRESHOLD) {
            // Dropped too early, reset
            state = "bottom";
            feedback = t("exercises.calfRaises.feedback.raise");
          } else {
            // Stay in raising
            feedback = t("exercises.calfRaises.feedback.raise");
          }
          break;

        case "top":
          // Must drop below MID_THRESHOLD to start lowering
          if (heelElevation < MID_THRESHOLD) {
            state = "lowering";
            feedback = t("exercises.calfRaises.feedback.lower");
          } else {
            feedback = t("exercises.calfRaises.feedback.holdTop");
          }
          break;

        case "lowering":
          // Must be clearly lowered to complete
          if (heelElevation < LOWERED_THRESHOLD) {
            // Rep completed!
            if (now - lastRepTimeRef.current > REP_DEBOUNCE_MS) {
              repCountRef.current += 1;
              lastRepTimeRef.current = now;
              feedback = t("exercises.calfRaises.feedback.complete");
              if (DEBUG_LOGGING) {
                console.log(
                  `[CalfRaises] ✅ REP #${repCountRef.current} completed!`,
                );
              }
            }
            state = "bottom";
          } else if (heelElevation > RAISED_THRESHOLD) {
            // Went back up without completing - back to top
            state = "top";
            feedback = t("exercises.calfRaises.feedback.holdTop");
          } else {
            // Stay in lowering
            feedback = t("exercises.calfRaises.feedback.lower");
          }
          break;
      }

      // Update state
      stateRef.current = state;

      // Calculate progress
      const progress = calculateProgress(state);

      const nextMetrics: Metrics = {
        repCount: repCountRef.current,
        heelElevation: Math.round(heelElevation * 1000) / 1000,
        progress: Math.round(progress),
        state,
        feedback,
      };

      // Throttle UI updates
      const shouldUpdateUi =
        now - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS;
      if (shouldUpdateUi) {
        lastUiUpdateRef.current = now;
        setMetrics(nextMetrics);
      }

      return nextMetrics;
    },
    [t],
  );

  const statItems = useMemo(
    () => [
      {
        label: t("exercises.calfRaises.labels.heelHeight"),
        value: `${(metrics.heelElevation * 100).toFixed(1)}%`,
      },
      {
        label: t("exercises.calfRaises.labels.state"),
        value: metrics.state,
      },
    ],
    [metrics.heelElevation, metrics.state, t],
  );

  return {
    metrics,
    processLandmarks,
    reset,
    statItems,
  };
};
