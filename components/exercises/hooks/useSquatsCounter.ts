import type { TFunction } from "i18next";
import { useCallback, useMemo, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

type SquatState = "idle" | "ready" | "descending" | "bottom" | "ascending";

type RepQuality = "good" | "perfect";

interface Metrics {
  repCount: number;
  feedback?: string;
  currentAngle: number;
  progress: number;
  state: SquatState;
  lastRepQuality: RepQuality | null;
}

const MIN_VISIBILITY = 0.55;
const UI_UPDATE_THROTTLE_MS = 140;
const REP_DEBOUNCE_MS = 300; // allow faster consecutive reps

// Thresholds aligned to original controller with slight lockout tolerance
const ANGLE_TOP_READY = 150;
const ANGLE_START_DESCENT = 145;
const ANGLE_BOTTOM = 130;
const ANGLE_ASCEND_TRIGGER = 140;
const ANGLE_COMPLETE = 150;
const ANGLE_COMPLETE_THRESHOLD = 145; // lockout tolerance

const calculateAngle = (
  p1: PoseLandmark,
  p2: PoseLandmark,
  p3: PoseLandmark,
) => {
  const radians =
    Math.atan2(p3.y - p2.y, p3.x - p2.x) - Math.atan2(p1.y - p2.y, p1.x - p2.x);
  let angle = Math.abs((radians * 180) / Math.PI);
  if (angle > 180) angle = 360 - angle;
  return angle;
};

export const useSquatsCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const lastUiUpdateRef = useRef(0);
  const squatStateRef = useRef<SquatState>("idle");
  const repCountRef = useRef(0);
  const lastRepQualityRef = useRef<RepQuality | null>(null);

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    currentAngle: 0,
    progress: 0,
    state: "idle",
    feedback: t("exercises.squats.feedback.noBody"),
    lastRepQuality: null,
  });

  const reset = useCallback(() => {
    squatStateRef.current = "idle";
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    repCountRef.current = 0;
    lastRepQualityRef.current = null;
    setMetrics((prev) => ({
      ...prev,
      repCount: 0,
      currentAngle: 0,
      progress: 0,
      state: "idle",
      lastRepQuality: null,
      feedback: t("exercises.squats.feedback.noBody"),
    }));
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      const now = Date.now();

      if (!landmarks || landmarks.length < 33) {
        squatStateRef.current = "idle";
        const next = {
          repCount: repCountRef.current,
          currentAngle: 0,
          progress: 0,
          state: "idle" as SquatState,
          lastRepQuality: lastRepQualityRef.current,
          feedback: t("exercises.squats.feedback.noPose"),
        };
        setMetrics(next);
        return next;
      }

      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];
      const leftKnee = landmarks[25];
      const rightKnee = landmarks[26];
      const leftAnkle = landmarks[27];
      const rightAnkle = landmarks[28];
      const allPointsExist =
        leftShoulder &&
        rightShoulder &&
        leftHip &&
        rightHip &&
        leftKnee &&
        rightKnee &&
        leftAnkle &&
        rightAnkle;

      if (!allPointsExist) {
        squatStateRef.current = "idle";
        const next = {
          repCount: repCountRef.current,
          currentAngle: 0,
          progress: 0,
          lastRepQuality: lastRepQualityRef.current,
          feedback: t("exercises.squats.feedback.noBody"),
          state: "idle" as SquatState,
        };
        setMetrics(next);
        return next;
      }

      const bodyFullyVisible =
        (leftShoulder.visibility ?? 0) > MIN_VISIBILITY &&
        (rightShoulder.visibility ?? 0) > MIN_VISIBILITY &&
        (leftHip.visibility ?? 0) > MIN_VISIBILITY &&
        (rightHip.visibility ?? 0) > MIN_VISIBILITY &&
        (leftKnee.visibility ?? 0) > MIN_VISIBILITY &&
        (rightKnee.visibility ?? 0) > MIN_VISIBILITY &&
        (leftAnkle.visibility ?? 0) > MIN_VISIBILITY &&
        (rightAnkle.visibility ?? 0) > MIN_VISIBILITY;

      const leftKneeAngle = calculateAngle(leftHip, leftKnee, leftAnkle);
      const rightKneeAngle = calculateAngle(rightHip, rightKnee, rightAnkle);
      const avgKneeAngle = (leftKneeAngle + rightKneeAngle) / 2;

      const angle = Math.round(avgKneeAngle);

      const progressSquatStateMachine = (currentState: SquatState) => {
        if (!bodyFullyVisible) {
          return {
            newState: "idle" as SquatState,
            feedback: t("exercises.squats.feedback.noBody"),
            incrementCount: false,
            progress: 0,
            quality: null as RepQuality | null,
          };
        }

        if (currentState === "idle") {
          if (avgKneeAngle > ANGLE_TOP_READY) {
            return {
              newState: "ready" as SquatState,
              feedback: t("exercises.squats.feedback.ready"),
              incrementCount: false,
              progress: 0,
              quality: null,
            };
          }
          return {
            newState: "idle" as SquatState,
            feedback: t("exercises.squats.feedback.standStraight"),
            incrementCount: false,
            progress: 0,
            quality: null,
          };
        }

        if (currentState === "ready") {
          if (avgKneeAngle < ANGLE_START_DESCENT) {
            return {
              newState: "descending" as SquatState,
              feedback: t("exercises.squats.feedback.goingDown"),
              incrementCount: false,
              progress: 10,
              quality: null,
            };
          }
          return {
            newState: "ready" as SquatState,
            feedback: t("exercises.squats.feedback.ready"),
            incrementCount: false,
            progress: 0,
            quality: null,
          };
        }

        if (currentState === "descending") {
          if (avgKneeAngle <= ANGLE_BOTTOM) {
            return {
              newState: "bottom" as SquatState,
              feedback: t("exercises.squats.feedback.perfectDepth"),
              incrementCount: false,
              progress: 50,
              quality: null,
            };
          }
          if (avgKneeAngle > ANGLE_TOP_READY) {
            return {
              newState: "ready" as SquatState,
              feedback: t("exercises.squats.feedback.goDeeper"),
              incrementCount: false,
              progress: 0,
              quality: null,
            };
          }
          const progress = Math.min(
            50,
            ((ANGLE_TOP_READY - avgKneeAngle) /
              (ANGLE_TOP_READY - ANGLE_BOTTOM)) *
              50,
          );
          return {
            newState: "descending" as SquatState,
            feedback: t("exercises.squats.feedback.keepGoing", { angle }),
            incrementCount: false,
            progress,
            quality: null,
          };
        }

        if (currentState === "bottom") {
          if (avgKneeAngle > ANGLE_ASCEND_TRIGGER) {
            return {
              newState: "ascending" as SquatState,
              feedback: t("exercises.squats.feedback.push"),
              incrementCount: false,
              progress: 60,
              quality: null,
            };
          }
          return {
            newState: "bottom" as SquatState,
            feedback: t("exercises.squats.feedback.goodPush"),
            incrementCount: false,
            progress: 50,
            quality: null,
          };
        }

        if (currentState === "ascending") {
          if (avgKneeAngle >= ANGLE_COMPLETE_THRESHOLD) {
            return {
              newState: "ready" as SquatState,
              feedback: t("exercises.squats.feedback.excellent"),
              incrementCount: true,
              progress: 100,
              quality: "perfect" as RepQuality,
            };
          }
          if (avgKneeAngle <= ANGLE_BOTTOM) {
            return {
              newState: "bottom" as SquatState,
              feedback: t("exercises.squats.feedback.keepPushing"),
              incrementCount: false,
              progress: 50,
              quality: null,
            };
          }
          const progress =
            50 +
            Math.min(
              50,
              ((avgKneeAngle - ANGLE_BOTTOM) /
                (ANGLE_COMPLETE - ANGLE_BOTTOM)) *
                50,
            );
          return {
            newState: "ascending" as SquatState,
            feedback: t("exercises.squats.feedback.almost", { angle }),
            incrementCount: false,
            progress,
            quality: null,
          };
        }

        return {
          newState: currentState,
          feedback: t("exercises.squats.feedback.keepPushing"),
          incrementCount: false,
          progress: 0,
          quality: null,
        };
      };

      const result = progressSquatStateMachine(squatStateRef.current);

      // Count rep with debounce and force re-arm to ready after counting
      if (
        result.incrementCount &&
        now - lastRepTimeRef.current > REP_DEBOUNCE_MS
      ) {
        lastRepTimeRef.current = now;
        repCountRef.current += 1;
        lastRepQualityRef.current = result.quality ?? "good";
        squatStateRef.current = "ready";
      } else {
        squatStateRef.current = result.newState;
      }

      const shouldUpdateUi =
        now - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS;
      const baseMetrics: Metrics = {
        repCount: repCountRef.current,
        feedback: result.feedback,
        progress: result.progress,
        currentAngle: angle,
        state: result.newState,
        lastRepQuality: lastRepQualityRef.current,
      };

      if (shouldUpdateUi) {
        lastUiUpdateRef.current = now;
        setMetrics(baseMetrics);
        return baseMetrics;
      }

      setMetrics(baseMetrics);
      return baseMetrics;
    },
    [t],
  );

  const statItems = useMemo(
    () => [
      {
        label: t("exercises.squats.stateLabel"),
        value: t(`exercises.squats.stateLabelValue.${metrics.state}` as const),
      },
      {
        label: t("exercises.squats.counterLabel"),
        value: `${metrics.currentAngle}°`,
      },
    ],
    [metrics.currentAngle, metrics.state, t],
  );

  return {
    metrics,
    processLandmarks,
    reset,
    statItems,
  };
};
