import type { TFunction } from "i18next";
import { useCallback, useMemo, useRef, useState } from "react";

import type { PoseLandmark } from "../exercises.types";

type Arm = "left" | "right";
type ArmState = "extended" | "curling" | "top";

const MIN_VISIBILITY = 0.55;
const ELBOW_EXTENDED_ANGLE = 155;
const ELBOW_TOP_ANGLE = 60;
const UI_UPDATE_THROTTLE_MS = 140;
const REP_DEBOUNCE_MS = 650;

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
  const clamped = Math.max(
    Math.min(angle, ELBOW_EXTENDED_ANGLE),
    ELBOW_TOP_ANGLE,
  );
  const range = ELBOW_EXTENDED_ANGLE - ELBOW_TOP_ANGLE;
  const value = ELBOW_EXTENDED_ANGLE - clamped;
  return Math.min(100, Math.max(0, (value / range) * 100));
};

interface Metrics {
  repCount: number;
  feedback?: string;
  leftAngle: number;
  rightAngle: number;
  progress: number;
}

export const useHammerCurlsCounter = (t: TFunction) => {
  const lastRepTimeRef = useRef(0);
  const repCountRef = useRef(0);
  const lastArmRef = useRef<Arm | null>(null);
  const lastUiUpdateRef = useRef(0);

  const [metrics, setMetrics] = useState<Metrics>({
    repCount: 0,
    leftAngle: 0,
    rightAngle: 0,
    progress: 0,
    feedback: t("exercises.hammerCurls.feedback.showArms"),
  });

  const reset = useCallback(() => {
    repCountRef.current = 0;
    lastArmRef.current = null;
    lastRepTimeRef.current = 0;
    lastUiUpdateRef.current = 0;
    setMetrics((prev) => ({
      ...prev,
      repCount: 0,
      feedback: t("exercises.hammerCurls.feedback.showArms"),
      progress: 0,
      leftAngle: 0,
      rightAngle: 0,
    }));
  }, [t]);

  const processLandmarks = useCallback(
    (landmarks?: PoseLandmark[]) => {
      if (!landmarks || landmarks.length < 17) {
        const next = {
          ...metrics,
          feedback: t("exercises.hammerCurls.feedback.noPose"),
          progress: 0,
        };
        setMetrics(next);
        return next;
      }

      const leftShoulder = landmarks[11];
      const rightShoulder = landmarks[12];
      const leftElbow = landmarks[13];
      const rightElbow = landmarks[14];
      const leftWrist = landmarks[15];
      const rightWrist = landmarks[16];

      const allPointsExist =
        leftShoulder &&
        rightShoulder &&
        leftElbow &&
        rightElbow &&
        leftWrist &&
        rightWrist;

      if (!allPointsExist) {
        const next = {
          ...metrics,
          feedback: t("exercises.hammerCurls.feedback.showArms"),
        };
        setMetrics(next);
        return next;
      }

      const bodyVisible =
        (leftShoulder.visibility ?? 0) > MIN_VISIBILITY &&
        (rightShoulder.visibility ?? 0) > MIN_VISIBILITY &&
        (leftElbow.visibility ?? 0) > MIN_VISIBILITY &&
        (rightElbow.visibility ?? 0) > MIN_VISIBILITY &&
        (leftWrist.visibility ?? 0) > MIN_VISIBILITY &&
        (rightWrist.visibility ?? 0) > MIN_VISIBILITY;

      if (!bodyVisible) {
        const next = {
          ...metrics,
          feedback: t("exercises.hammerCurls.feedback.improveLight"),
        };
        setMetrics(next);
        return next;
      }

      const leftElbowAngle = calculateAngle(leftShoulder, leftElbow, leftWrist);
      const rightElbowAngle = calculateAngle(
        rightShoulder,
        rightElbow,
        rightWrist,
      );

      const classifyState = (angle: number): ArmState => {
        if (angle < ELBOW_TOP_ANGLE) return "top";
        if (angle > ELBOW_EXTENDED_ANGLE) return "extended";
        return "curling";
      };

      const leftState = classifyState(leftElbowAngle);
      const rightState = classifyState(rightElbowAngle);

      const otherExtendedEnough = (arm: Arm) => {
        return arm === "left"
          ? rightElbowAngle > ELBOW_EXTENDED_ANGLE - 10
          : leftElbowAngle > ELBOW_EXTENDED_ANGLE - 10;
      };

      let feedback = t("exercises.hammerCurls.feedback.curl");
      let progress = metrics.progress;
      let repCount = metrics.repCount;

      const tryCount = (arm: Arm, angle: number, state: ArmState) => {
        if (state !== "top") return;
        if (!otherExtendedEnough(arm)) return;
        if (lastArmRef.current && lastArmRef.current === arm) return;

        const nowTime = Date.now();
        if (nowTime - lastRepTimeRef.current < REP_DEBOUNCE_MS) return;

        lastRepTimeRef.current = nowTime;
        lastArmRef.current = arm;
        repCountRef.current += 1;
        repCount = repCountRef.current;
        progress = mapProgress(angle);
        feedback = t("exercises.hammerCurls.feedback.counting", {
          arm: t(`exercises.hammerCurls.armLabel.${arm}` as const),
        });
      };

      tryCount("left", leftElbowAngle, leftState);
      tryCount("right", rightElbowAngle, rightState);

      if (leftState === "extended" && rightState === "extended") {
        feedback = t("exercises.hammerCurls.feedback.bothDown");
        progress = 0;
      }

      const nowUi = Date.now();
      const shouldUpdateUi =
        nowUi - lastUiUpdateRef.current > UI_UPDATE_THROTTLE_MS;
      const baseMetrics = {
        ...metrics,
        repCount,
        feedback,
      };

      if (shouldUpdateUi) {
        lastUiUpdateRef.current = nowUi;
        const nextMetrics: Metrics = {
          ...baseMetrics,
          leftAngle: Math.round(leftElbowAngle),
          rightAngle: Math.round(rightElbowAngle),
          progress,
        };
        setMetrics(nextMetrics);
        return nextMetrics;
      }

      const nextMetrics: Metrics = {
        ...baseMetrics,
        progress,
      };
      setMetrics(nextMetrics);
      return nextMetrics;
    },
    [metrics, t],
  );

  const statItems = useMemo(
    () => [
      {
        label: t("exercises.hammerCurls.armLabel.left"),
        value: `${metrics.leftAngle}°`,
      },
      {
        label: t("exercises.hammerCurls.armLabel.right"),
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
