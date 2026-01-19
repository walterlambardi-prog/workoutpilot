import { switchCamera } from "@thinksys/react-native-mediapipe";
import { useCallback, useState } from "react";

import type { Status } from "../exercises.types";

/**
 * Hook for managing MediaPipe pose detection state and callbacks (native)
 */
export const usePoseDetection = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [message, setMessage] = useState("Cámara iniciada");
  const [poseCount, setPoseCount] = useState(0);

  const handleLandmark = useCallback((data: unknown) => {
    try {
      if (data && Array.isArray(data) && data.length > 0) {
        setStatus("detecting");
        setPoseCount(1);
        setMessage("Pose detectada");
      } else {
        setPoseCount(0);
        setMessage("Sin pose detectada");
      }
    } catch (error) {
      setStatus("error");
      setMessage("Error procesando landmarks");
      console.error("Error processing landmarks:", error);
    }
  }, []);

  const handleSwitchCamera = useCallback(() => {
    try {
      switchCamera();
      setMessage("Cámara cambiada");
    } catch (error) {
      setStatus("error");
      setMessage("Error al cambiar cámara");
      console.error("Error switching camera:", error);
    }
  }, []);

  return {
    status,
    message,
    poseCount,
    handleLandmark,
    handleSwitchCamera,
  };
};
