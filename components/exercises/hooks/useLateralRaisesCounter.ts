import type { TFunction } from "i18next";
import { useCallback, useMemo, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

const MIN_VISIBILITY = 0.55;
// Softer thresholds so reaching ~shoulder height counts as "up"
const ANGLE_UP = 62; // was 72
const ANGLE_UP_RELEASE = 54; // was 64
const ANGLE_DOWN = 38; // was 32
const ANGLE_DOWN_RESET = 44; // was 38
const UI_UPDATE_THROTTLE_MS = 120;
const REP_DEBOUNCE_MS = 300;

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

const mapProgress = (angle: number) => {
  const clamped = Math.max(Math.min(angle, ANGLE_UP), ANGLE_DOWN);
  const range = ANGLE_UP - ANGLE_DOWN;
  const value = clamped - ANGLE_DOWN;
  return Math.min(100, Math.max(0, (value / range) * 100));
};

interface Metrics {
  repCount: number;
  feedback?: string;
  leftAngle: number;
  rightAngle: number;
  progress: number;
}

export const useLateralRaisesCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const repCountRef = useRef(0);
  const stateRef = useRef<"down" | "raising" | "up" | "lowering">("down");
  const lastUiUpdateRef = useRef(0);
  const debugLogRef = useRef(0);

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    leftAngle: 0,
    rightAngle: 0,
    progress: 0,
    feedback: t("exercises.lateralRaises.feedback.showShoulders"),
  });

  const reset = useCallback(() => {
    repCountRef.current = 0;
    stateRef.current = "down";
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    setMetrics((prev) => ({
      ...prev,
      repCount: 0,
      feedback: t("exercises.lateralRaises.feedback.showShoulders"),
      progress: 0,
      leftAngle: 0,
      rightAngle: 0,
    }));
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      if (!landmarks || landmarks.length < 25) {
        setMetrics((prev) => ({
          ...prev,
          feedback: t("exercises.lateralRaises.feedback.noPose"),
          progress: 0,
        }));
        return {
          ...metrics,
          feedback: t("exercises.lateralRaises.feedback.noPose"),
          progress: 0,
        } as Metrics;
      }

      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];
      const leftHip = landmarks[23];
      const rightHip = landmarks[24];

      const allPointsExist =
        leftShoulder &&
        rightShoulder &&
        leftElbow &&
        rightElbow &&
        leftHip &&
        rightHip;

      if (!allPointsExist) {
        const next = {
          ...metrics,
          feedback: t("exercises.lateralRaises.feedback.showShoulders"),
        };
        setMetrics(next);
        return next;
      }

      const bodyVisible =
        (leftShoulder.visibility ?? 0) > MIN_VISIBILITY &&
        (rightShoulder.visibility ?? 0) > MIN_VISIBILITY &&
        (leftElbow.visibility ?? 0) > MIN_VISIBILITY &&
        (rightElbow.visibility ?? 0) > MIN_VISIBILITY &&
        (leftHip.visibility ?? 0) > MIN_VISIBILITY &&
        (rightHip.visibility ?? 0) > MIN_VISIBILITY;

      if (!bodyVisible) {
        const next = {
          ...metrics,
          feedback: t("exercises.lateralRaises.feedback.improveLight"),
        };
        setMetrics(next);
        return next;
      }

      const leftAngleVal = calculateAngle(leftElbow, leftShoulder, leftHip);
      const rightAngleVal = calculateAngle(rightElbow, rightShoulder, rightHip);

      const nowDebug = Date.now();
      if (nowDebug - debugLogRef.current > 500) {
        debugLogRef.current = nowDebug;
      }

      const now = Date.now();
      let nextMetrics: Metrics = metrics;

      if (now - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS) {
        lastUiUpdateRef.current = now;
        nextMetrics = {
          ...metrics,
          leftAngle: Math.round(leftAngleVal),
          rightAngle: Math.round(rightAngleVal),
          progress:
            (mapProgress(leftAngleVal) + mapProgress(rightAngleVal)) / 2,
        };
        setMetrics(nextMetrics);
      }

      const bothDown = leftAngleVal < ANGLE_DOWN && rightAngleVal < ANGLE_DOWN;
      const bothReset =
        leftAngleVal < ANGLE_DOWN_RESET && rightAngleVal < ANGLE_DOWN_RESET;
      const avgAngle = (leftAngleVal + rightAngleVal) / 2;
      const minAngle = Math.min(leftAngleVal, rightAngleVal);
      const bothUp = avgAngle > ANGLE_UP && minAngle > ANGLE_UP - 6;
      const leavingUp =
        avgAngle < ANGLE_UP_RELEASE || minAngle < ANGLE_UP_RELEASE;

      if (bothReset && stateRef.current !== "down") {
        stateRef.current = "down";
        const next = {
          ...nextMetrics,
          feedback: t("exercises.lateralRaises.feedback.armsDown"),
        };
        setMetrics(next);
        return next;
      }

      if (stateRef.current === "down" && !bothDown) {
        stateRef.current = "raising";
        nextMetrics = {
          ...nextMetrics,
          feedback: t("exercises.lateralRaises.feedback.raise"),
        };
        setMetrics(nextMetrics);
      }

      if (bothUp && stateRef.current !== "up") {
        const nowTime = Date.now();
        if (nowTime - lastRepTimeRef.current > REP_DEBOUNCE_MS) {
          lastRepTimeRef.current = nowTime;
          stateRef.current = "up";
          repCountRef.current += 1;

          nextMetrics = {
            ...nextMetrics,
            repCount: repCountRef.current,
            feedback: t("exercises.lateralRaises.feedback.upHold"),
          };
          setMetrics(nextMetrics);
        }
        return nextMetrics;
      }

      if (stateRef.current === "up" && leavingUp) {
        stateRef.current = "lowering";
        const next = {
          ...nextMetrics,
          feedback: t("exercises.lateralRaises.feedback.lower"),
        };
        setMetrics(next);
        return next;
      }

      if (!bothDown && !bothUp && stateRef.current !== "raising") {
        stateRef.current = "raising";
        const next = {
          ...nextMetrics,
          feedback: t("exercises.lateralRaises.feedback.raise"),
        };
        setMetrics(next);
        return next;
      }
      return nextMetrics;
    },
    [metrics, t],
  );

  const statItems = useMemo(
    () => [
      {
        label: t("exercises.lateralRaises.armLabel.left"),
        value: `${metrics.leftAngle}°`,
      },
      {
        label: t("exercises.lateralRaises.armLabel.right"),
        value: `${metrics.rightAngle}°`,
      },
    ],
    [metrics.leftAngle, metrics.rightAngle, t],
  );

  return {
    metrics,
    processLandmarks,
    reset,
    statItems,
  };
};
