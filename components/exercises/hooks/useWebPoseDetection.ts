import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { ExerciseId } from "@/constants/exercises";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { drawPoseLandmarks } from "@/utils/poseDrawing";

import {
  MEDIAPIPE_CONFIG,
  POSE_MODEL_URL,
  WASM_BASE_URL,
} from "../exercises.constants";
import type {
  MediaPipeResult,
  PoseMessageKey,
  PoseStats,
  Status,
} from "../exercises.types";
import { useLateralRaisesCounter } from "./useLateralRaisesCounter";

/**
 * Hook for managing MediaPipe pose detection on web platform
 * Uses @mediapipe/tasks-vision for browser-based pose detection
 */
export const useWebPoseDetection = (exerciseId?: ExerciseId) => {
  const [status, setStatus] = useState<Status>("idle");
  const [messageKey, setMessageKey] =
    useState<PoseMessageKey>("promptCameraAccess");
  const [stats, setStats] = useState<PoseStats | null>(null);
  const lastRepCountRef = useRef(0);

  const { t } = useTranslation();
  const lateralRaises = useLateralRaisesCounter(t);
  const reportedRepRef = useRef(0);

  const poseRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

  const processFrame = useCallback(() => {
    const video = videoRef.current;
    const poseLandmarker = poseRef.current;
    const canvas = canvasRef.current;

    if (!video || video.readyState < 2) {
      rafRef.current = requestAnimationFrame(processFrame);
      return;
    }

    const now = performance.now();

    if (poseLandmarker && canvas) {
      const { videoWidth, videoHeight } = video;

      if (!videoWidth || !videoHeight) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      if (canvas.width !== videoWidth || canvas.height !== videoHeight) {
        canvas.width = videoWidth;
        canvas.height = videoHeight;
      }

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        rafRef.current = requestAnimationFrame(processFrame);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const result: MediaPipeResult = poseLandmarker.detectForVideo(video, now);
      const landmarks = result?.landmarks?.[0];

      if (landmarks) {
        drawPoseLandmarks({ canvas, landmarks });

        if (exerciseId === ExerciseId.LATERAL_RAISES) {
          const next = lateralRaises.processLandmarks(landmarks);
          const rep = next?.repCount ?? 0;
          const stableRep = Math.max(lastRepCountRef.current, rep);
          lastRepCountRef.current = stableRep;
          if (exerciseId) {
            const prev = reportedRepRef.current;
            if (stableRep > prev) {
              useExerciseSessionStore
                .getState()
                .addRep(exerciseId, stableRep - prev);
              reportedRepRef.current = stableRep;
            }
          }
          setStats({
            poseCount: 1,
            repCount: stableRep,
            progress: next?.progress,
            feedback: next?.feedback,
          });
        } else {
          setStats({ poseCount: 1 });
        }
        setMessageKey("liveLandmarks");
      } else {
        if (exerciseId === ExerciseId.LATERAL_RAISES) {
          const next = lateralRaises.processLandmarks(undefined);
          const rep = next?.repCount ?? 0;
          const stableRep = Math.max(lastRepCountRef.current, rep);
          lastRepCountRef.current = stableRep;
          if (exerciseId) {
            const prev = reportedRepRef.current;
            if (stableRep > prev) {
              useExerciseSessionStore
                .getState()
                .addRep(exerciseId, stableRep - prev);
              reportedRepRef.current = stableRep;
            }
          }
          setStats({
            poseCount: 0,
            repCount: stableRep,
            progress: next?.progress,
            feedback: next?.feedback,
          });
        } else {
          setStats({ poseCount: 0 });
        }
        setMessageKey("noPoseDetected");
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, [exerciseId, lateralRaises]);

  const startCamera = useCallback(async () => {
    if (!poseRef.current) {
      setMessageKey("modelNotReady");
      return;
    }

    try {
      setStatus("running");
      setMessageKey("requestingWebcam");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) return;

      video.srcObject = stream;
      await video.play();
      setMessageKey("processing");
      rafRef.current = requestAnimationFrame(processFrame);
    } catch (error: any) {
      setStatus("error");
      setMessageKey("webcamStartError");
      console.error("Error starting webcam:", error);
    }
  }, [processFrame]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current ?? 0);
    rafRef.current = undefined;
    streamRef.current?.getTracks()?.forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("ready");
    setMessageKey("webcamStopped");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        setStatus("loading");
        setMessageKey("modelLoading");
        const vision = await import("@mediapipe/tasks-vision");
        const { FilesetResolver, PoseLandmarker } = vision;

        const resolver = await FilesetResolver.forVisionTasks(WASM_BASE_URL);
        const poseLandmarker = await PoseLandmarker.createFromOptions(
          resolver,
          {
            baseOptions: {
              modelAssetPath: POSE_MODEL_URL,
            },
            ...MEDIAPIPE_CONFIG,
          },
        );

        if (cancelled) {
          poseLandmarker.close?.();
          return;
        }

        poseRef.current = poseLandmarker;
        setStatus("ready");
        setMessageKey("modelLoaded");
      } catch (error: any) {
        setStatus("error");
        setMessageKey("modelLoadError");
        console.error("Error loading model:", error);
      }
    };

    loadModel();

    return () => {
      cancelled = true;
      cancelAnimationFrame(rafRef.current ?? 0);
      poseRef.current?.close?.();
      streamRef.current?.getTracks()?.forEach((t) => t.stop());
    };
  }, []);

  return {
    status,
    messageKey,
    stats,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  };
};
