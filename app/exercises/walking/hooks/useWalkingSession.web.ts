import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import type { LatLng } from "@/components/MapView/MapView.types";
import { useWalkingSessionStore } from "@/stores/walkingSessionStore";

import type { WalkingStatusKey } from "../walking.types";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

const calculateDistanceKm = (positions: LatLng[]): number => {
  if (positions.length < 2) return 0;
  let distance = 0;
  for (let i = 1; i < positions.length; i += 1) {
    const prev = positions[i - 1];
    const curr = positions[i];
    const dLat = toRadians(curr.latitude - prev.latitude);
    const dLon = toRadians(curr.longitude - prev.longitude);
    const lat1 = toRadians(prev.latitude);
    const lat2 = toRadians(curr.latitude);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const earthRadiusKm = 6371;
    distance += earthRadiusKm * c;
  }
  return distance;
};

export const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

export const useWalkingSession = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<WalkingStatusKey>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [elapsedMs, setElapsedMs] = useState(0);
  const [isSecureContext, setIsSecureContext] = useState<boolean>(true);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );
  const browserWatchIdRef = useRef<number | null>(null);

  const {
    activeSession,
    startActiveSession,
    addPositionToActiveSession,
    finalizeActiveSession,
  } = useWalkingSessionStore();

  const positions = useMemo(
    () => activeSession?.positions ?? [],
    [activeSession?.positions],
  );

  useEffect(() => {
    // Ensure geolocation API is available in browsers
    if (Location.installWebGeolocationPolyfill) {
      Location.installWebGeolocationPolyfill();
    }

    if (typeof window !== "undefined") {
      const secure =
        window.isSecureContext || window.location.hostname === "localhost";
      setIsSecureContext(secure);
    }
  }, []);

  // Restore active session on mount
  useEffect(() => {
    if (activeSession && activeSession.startedAt) {
      setStatus("tracking");
      startTimestampRef.current = activeSession.startedAt;
      // Restart tracking if there was an active session
      void startTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const syncElapsed = useCallback(() => {
    if (startTimestampRef.current) {
      setElapsedMs(Date.now() - startTimestampRef.current);
    }
  }, []);

  const startTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    syncElapsed();
    timerRef.current = setInterval(syncElapsed, 1000);
  }, [syncElapsed]);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopSubscriptions = useCallback(() => {
    stopTimer();

    // Handle Expo Location subscription removal (web compatibility)
    if (locationSubscriptionRef.current) {
      try {
        // Try the remove method first (native)
        if (typeof locationSubscriptionRef.current.remove === "function") {
          locationSubscriptionRef.current.remove();
        }
      } catch (error) {
        console.warn("Failed to remove location subscription:", error);
      }
      locationSubscriptionRef.current = null;
    }

    // Handle browser geolocation API
    if (
      browserWatchIdRef.current !== null &&
      typeof navigator !== "undefined" &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(browserWatchIdRef.current);
      browserWatchIdRef.current = null;
    }
  }, [stopTimer]);

  const requestPermissions = useCallback(async () => {
    if (!isSecureContext) {
      setStatus("error");
      setErrorMessage(t("walking.errors.insecureContext"));
      return false;
    }

    setStatus("requesting");
    try {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (fgStatus !== "granted") {
        setStatus("error");
        setErrorMessage(t("walking.errors.permissionDenied"));
        return false;
      }

      return true;
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("walking.errors.unknown"),
      );
      return false;
    }
  }, [isSecureContext, t]);

  const startTracking = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    try {
      // Initialize store session if not already active
      if (!activeSession) {
        startActiveSession();
        startTimestampRef.current = Date.now();
      }

      setErrorMessage(undefined);
      setStatus("tracking");
      startTimer();

      // Start location tracking
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 5000, // Update every 5 seconds
          distanceInterval: 5, // Update every 5 meters
        },
        (location) => {
          const newPosition: LatLng = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          };
          addPositionToActiveSession(newPosition);
        },
      );

      locationSubscriptionRef.current = subscription;
    } catch (error) {
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("walking.errors.unknown"),
      );
    }
  }, [
    requestPermissions,
    activeSession,
    startActiveSession,
    startTimer,
    addPositionToActiveSession,
    t,
  ]);

  const stopTracking = useCallback(async () => {
    try {
      stopSubscriptions();
      finalizeActiveSession();
      setStatus("paused");
      setElapsedMs(0);
      startTimestampRef.current = null;
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("walking.errors.unknown"),
      );
    }
  }, [finalizeActiveSession, stopSubscriptions, t]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (status === "tracking") {
        stopSubscriptions();
      }
    };
  }, [status, stopSubscriptions]);

  const distanceKm = useMemo(() => calculateDistanceKm(positions), [positions]);

  const stats = [
    {
      key: "distance",
      label: t("walking.stats.distance"),
      value: t("walking.stats.distanceValue", {
        distance: distanceKm.toFixed(2),
      }),
    },
    {
      key: "duration",
      label: t("walking.stats.duration"),
      value: formatDuration(elapsedMs),
    },
  ];

  return {
    status,
    errorMessage,
    positions,
    stats,
    elapsedMs,
    distanceKm,
    startTracking,
    stopTracking,
  };
};
