import type {
    MediaPipeResult,
    PoseStats,
    Status,
} from "@/components/exercises/exercises.types";
import {
    MEDIAPIPE_CONFIG,
    POSE_MODEL_URL,
    WASM_BASE_URL,
} from "@/constants/exercises";
import { drawPoseLandmarks } from "@/utils/poseDrawing";
import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Hook for managing MediaPipe pose detection on web platform
 * Uses @mediapipe/tasks-vision for WASM-based pose detection
 * @returns Web pose detection state, refs, and control functions
 */
export const useWebPoseDetection = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState(
    'Permite la cámara y presiona "Iniciar webcam".',
  );
  const [stats, setStats] = useState<PoseStats | null>(null);

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
        setStats({ poseCount: 1 });
        setMessage("Landmarks en vivo");
      } else {
        setStats({ poseCount: 0 });
        setMessage("Sin pose detectada");
      }
    }

    rafRef.current = requestAnimationFrame(processFrame);
  }, []);

  const startCamera = useCallback(async () => {
    if (!poseRef.current) {
      setMessage("Modelo aún no listo");
      return;
    }

    try {
      setStatus("running");
      setMessage("Solicitando acceso a la webcam...");

      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      streamRef.current = stream;
      const video = videoRef.current;

      if (!video) return;

      video.srcObject = stream;
      await video.play();
      setMessage("Procesando...");
      rafRef.current = requestAnimationFrame(processFrame);
    } catch (error: any) {
      setStatus("error");
      setMessage(error?.message ?? "No se pudo iniciar la webcam");
    }
  }, [processFrame]);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current ?? 0);
    rafRef.current = undefined;
    streamRef.current?.getTracks()?.forEach((t) => t.stop());
    streamRef.current = null;
    setStatus("ready");
    setMessage("Webcam detenida.");
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        setStatus("loading");
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
        setMessage('Modelo cargado. Presiona "Iniciar webcam".');
      } catch (error: any) {
        setStatus("error");
        setMessage(error?.message ?? "Error al cargar el modelo");
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
    message,
    stats,
    videoRef,
    canvasRef,
    startCamera,
    stopCamera,
  };
};
