import { switchCamera } from "@thinksys/react-native-mediapipe";
import { useCallback, useState } from "react";

import type { PoseMessageKey, Status } from "../exercises.types";

/**
 * Hook for managing MediaPipe pose detection state and callbacks (native)
 */
export const usePoseDetection = () => {
  const [status, setStatus] = useState<Status>("idle");
  const [messageKey, setMessageKey] = useState<PoseMessageKey>("cameraReady");
  const [poseCount, setPoseCount] = useState(0);

  const handleLandmark = useCallback((data: unknown) => {
    try {
      if (data && Array.isArray(data) && data.length > 0) {
        setStatus("detecting");
        setPoseCount(1);
        setMessageKey("poseDetected");
      } else {
        setPoseCount(0);
        setMessageKey("noPoseDetected");
      }
    } catch (error) {
      setStatus("error");
      setMessageKey("processingError");
      console.error("Error processing landmarks:", error);
    }
  }, []);

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
    handleLandmark,
    handleSwitchCamera,
  };
};
