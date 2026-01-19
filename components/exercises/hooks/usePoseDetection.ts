import { switchCamera } from "@thinksys/react-native-mediapipe";
import { useCallback, useRef, useState } from "react";

import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";

import { ExerciseId } from "@/constants/exercises";

import type { TFunction } from "i18next";
import type { PoseLandmark, PoseMessageKey, Status } from "../exercises.types";
import { useLateralRaisesCounter } from "./useLateralRaisesCounter";

/**
 * Hook for managing MediaPipe pose detection state and callbacks (native)
 */
export const usePoseDetection = (params: {
  exerciseId?: ExerciseId;
  t: TFunction;
}) => {
  const { exerciseId, t } = params;
  const [status, setStatus] = useState<Status>("idle");
  const [messageKey, setMessageKey] = useState<PoseMessageKey>("cameraReady");
  const [poseCount, setPoseCount] = useState(0);
  const [repCount, setRepCount] = useState<number | undefined>(undefined);
  const [feedback, setFeedback] = useState<string | undefined>(undefined);
  const lastRepCountRef = useRef(0);
  const reportedRepRef = useRef(0);

  const lateralRaises = useLateralRaisesCounter(t);

  const extractLandmarks = useCallback((rawPayload: unknown) => {
    let payload = rawPayload;

    if (typeof payload === "string") {
      try {
        payload = JSON.parse(payload);
      } catch {
        // leave as string if not JSON
      }
    }

    // Unwrap common wrappers
    if (payload && typeof payload === "object") {
      if ((payload as any).nativeEvent) {
        payload = (payload as any).nativeEvent;
      } else if ((payload as any).data) {
        payload = (payload as any).data;
      }
    }

    // Common shapes: PoseLandmarks array, [ [landmarks] ], or { landmarks: [...] }
    if (Array.isArray(payload)) {
      if (Array.isArray(payload[0])) {
        return payload[0] as PoseLandmark[];
      }
      if (Array.isArray((payload as any)[0]?.landmarks)) {
        return (payload as any)[0].landmarks as PoseLandmark[];
      }
      return payload as PoseLandmark[];
    }

    if (payload && typeof payload === "object") {
      const maybeLandmarks = (payload as any).landmarks;
      if (Array.isArray(maybeLandmarks)) {
        return Array.isArray(maybeLandmarks[0])
          ? (maybeLandmarks[0] as PoseLandmark[])
          : (maybeLandmarks as PoseLandmark[]);
      }

      // Some native payloads: { landmarks: { 0: [...] } }
      if (maybeLandmarks && typeof maybeLandmarks === "object") {
        const values = Object.values(maybeLandmarks as Record<string, unknown>);
        if (Array.isArray(values[0])) {
          return values[0] as PoseLandmark[];
        }
      }

      // Maybe nested inside landmarks.landmarks
      if (
        maybeLandmarks?.landmarks &&
        Array.isArray(maybeLandmarks.landmarks)
      ) {
        const nested = (maybeLandmarks as any).landmarks;
        if (Array.isArray(nested[0])) {
          return nested[0] as PoseLandmark[];
        }
        return nested as PoseLandmark[];
      }

      const maybePoses = (payload as any).poses;
      if (Array.isArray(maybePoses) && maybePoses[0]?.landmarks) {
        const lm = maybePoses[0].landmarks;
        return Array.isArray(lm[0])
          ? (lm[0] as PoseLandmark[])
          : (lm as PoseLandmark[]);
      }

      // Last resort: object values might be the array
      const values = Object.values(payload as Record<string, unknown>);
      if (Array.isArray(values[0])) {
        return values[0] as PoseLandmark[];
      }
    }

    return undefined;
  }, []);

  const handleLandmark = useCallback(
    (data: unknown) => {
      try {
        const landmarks = extractLandmarks(data);

        if (landmarks && landmarks.length > 0) {
          setStatus("detecting");
          setPoseCount(landmarks.length);
          setMessageKey("poseDetected");

          if (exerciseId === ExerciseId.LATERAL_RAISES) {
            const next = lateralRaises.processLandmarks(landmarks);
            const rep = next?.repCount ?? 0;
            const stableRep = Math.max(lastRepCountRef.current, rep);
            lastRepCountRef.current = stableRep;
            setRepCount(stableRep);
            if (exerciseId) {
              const prev = reportedRepRef.current;
              if (stableRep > prev) {
                useExerciseSessionStore
                  .getState()
                  .addRep(exerciseId, stableRep - prev);
                reportedRepRef.current = stableRep;
              }
            }
            setFeedback(next?.feedback);
          }
        } else {
          setPoseCount(0);
          setMessageKey("noPoseDetected");
          if (exerciseId === ExerciseId.LATERAL_RAISES) {
            const next = lateralRaises.processLandmarks(undefined);
            const rep = next?.repCount ?? 0;
            const stableRep = Math.max(lastRepCountRef.current, rep);
            lastRepCountRef.current = stableRep;
            setRepCount(stableRep);
            if (exerciseId) {
              const prev = reportedRepRef.current;
              if (stableRep > prev) {
                useExerciseSessionStore
                  .getState()
                  .addRep(exerciseId, stableRep - prev);
                reportedRepRef.current = stableRep;
              }
            }
            setFeedback(next?.feedback);
          }
        }
      } catch (error) {
        setStatus("error");
        setMessageKey("processingError");
        console.error("Error processing landmarks:", error);
      }
    },
    [exerciseId, extractLandmarks, lateralRaises],
  );

  const handleSwitchCamera = useCallback(() => {
    try {
      switchCamera();
      setMessageKey("cameraSwitched");
    } catch (error) {
      setStatus("error");
      setMessageKey("cameraSwitchError");
      console.error("Error switching camera:", error);
    }
  }, []);

  return {
    status,
    messageKey,
    poseCount,
    repCount,
    feedback,
    handleLandmark,
    handleSwitchCamera,
  };
};
