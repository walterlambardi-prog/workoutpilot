import * as Location from "expo-location";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    AppState,
    type AppStateStatus,
    PermissionsAndroid,
    Platform,
} from "react-native";

import type { LatLng } from "@/components/MapView/MapView.types";
import { useWalkingSessionStore } from "@/stores/walkingSessionStore";
import WalkingTrackingService from "@/utils/WalkingTrackingService";

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
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Use selectors to subscribe to store changes correctly
  const activeSession = useWalkingSessionStore((state) => state.activeSession);
  const startActiveSession = useWalkingSessionStore(
    (state) => state.startActiveSession,
  );
  const updateActiveSession = useWalkingSessionStore(
    (state) => state.updateActiveSession,
  );
  const addPositionToActiveSession = useWalkingSessionStore(
    (state) => state.addPositionToActiveSession,
  );
  const finalizeActiveSession = useWalkingSessionStore(
    (state) => state.finalizeActiveSession,
  );

  const steps = activeSession?.steps ?? 0;
  const positions = useMemo(
    () => activeSession?.positions ?? [],
    [activeSession?.positions],
  );

  const syncElapsed = useCallback(() => {
    if (activeSession) {
      setElapsedMs(Date.now() - activeSession.startedAt);
    }
  }, [activeSession]);

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

  const requestPermissions = useCallback(async () => {
    setStatus("requesting");
    try {
      // First, request location permissions using Expo (shows native dialog)
      const { status: foregroundStatus } =
        await Location.requestForegroundPermissionsAsync();

      if (foregroundStatus !== "granted") {
        setStatus("error");
        setErrorMessage(t("walking.errors.permissionDenied"));
        return false;
      }

      // Request background location for Android 10+ and iOS
      if (Platform.OS === "android" && Platform.Version >= 29) {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== "granted") {
          setErrorMessage(t("walking.errors.backgroundPermissionDenied"));
          // Continue anyway, but warn user
        }
      } else if (Platform.OS === "ios") {
        // iOS handles "always" permission through the native module
        const permissions = await WalkingTrackingService.requestPermissions();
        if (permissions.location !== "granted") {
          setErrorMessage(t("walking.errors.backgroundPermissionDenied"));
        }
      }

      // Request activity recognition permission (Android 10+)
      if (Platform.OS === "android" && Platform.Version >= 29) {
        console.log(
          "[WalkingSession] 📋 Requesting ACTIVITY_RECOGNITION permission...",
        );

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: t("walking.permissions.activityTitle"),
            message: t("walking.permissions.activityMessage"),
            buttonPositive: t("common.allow"),
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log(
            "[WalkingSession] ⚠️ ACTIVITY_RECOGNITION permission denied",
          );
          setErrorMessage(t("walking.steps.unavailable"));
          // Allow to continue without step counting
        } else {
          console.log(
            "[WalkingSession] ✅ ACTIVITY_RECOGNITION permission granted",
          );
        }
      }

      // Check motion/activity permissions from native module
      const nativePermissions =
        await WalkingTrackingService.requestPermissions();

      console.log("[WalkingSession] 📋 Native permissions:", nativePermissions);

      if (nativePermissions.motion === "denied") {
        setErrorMessage(t("walking.steps.unavailable"));
        // Allow to continue without step counting
      }

      return true;
    } catch (error) {
      console.log("[WalkingSession] ❌ Error requesting permissions:", error);
      setStatus("error");
      setErrorMessage(t("walking.errors.permissionDenied"));
      return false;
    }
  }, [t]);

  const startTracking = useCallback(async () => {
    console.log("[WalkingSession] 🚀 Starting tracking...");

    const granted = await requestPermissions();
    if (!granted) {
      console.log("[WalkingSession] ❌ Permissions not granted");
      return;
    }

    try {
      // Initialize store session FIRST (before native events start arriving)
      console.log("[WalkingSession] 📝 Creating active session in store");
      startActiveSession();

      setErrorMessage(undefined);
      setStatus("tracking");
      startTimer();

      // Start native tracking (events will now update the active session)
      console.log("[WalkingSession] 📱 Starting native tracking module");
      const result = await WalkingTrackingService.startTracking();

      if (!result.success) {
        console.log(
          "[WalkingSession] ❌ Native tracking failed:",
          result.message,
        );
        setStatus("error");
        setErrorMessage(result.message);
        return;
      }

      console.log("[WalkingSession] ✅ Tracking started successfully");
    } catch (error) {
      console.log("[WalkingSession] ❌ Error starting tracking:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("walking.errors.unknown"),
      );
    }
  }, [requestPermissions, startActiveSession, startTimer, t]);

  const stopTracking = useCallback(async () => {
    try {
      await WalkingTrackingService.stopTracking();
      stopTimer();
      finalizeActiveSession();
      setStatus("paused");
      setElapsedMs(0);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("walking.errors.unknown"),
      );
    }
  }, [finalizeActiveSession, stopTimer, t]);

  const resumeTrackingIfNeeded = useCallback(async () => {
    if (!activeSession) {
      console.log("[WalkingSession] No active session, skipping resume");
      return;
    }

    try {
      const isTracking = await WalkingTrackingService.isTracking();
      console.log("[WalkingSession] isTracking:", isTracking);

      if (isTracking) {
        console.log("[WalkingSession] Resuming tracking from background");
        setStatus("tracking");
        startTimer();

        // Retrieve pending positions collected while in background
        const pendingPositions =
          await WalkingTrackingService.getPendingPositions();
        console.log(
          "[WalkingSession] Retrieved pending positions:",
          pendingPositions.length,
        );

        if (pendingPositions.length > 0) {
          console.log("[WalkingSession] Adding pending positions to session");
          pendingPositions.forEach((pos, index) => {
            console.log(
              `[WalkingSession] Adding position ${index + 1}/${pendingPositions.length}:`,
              pos.latitude,
              pos.longitude,
            );
            addPositionToActiveSession({
              latitude: pos.latitude,
              longitude: pos.longitude,
            });
          });
        }

        return;
      }

      // Restart tracking if session exists but native tracking stopped
      const granted = await requestPermissions();
      if (!granted) return;

      const result = await WalkingTrackingService.startTracking();
      if (result.success) {
        setStatus("tracking");
        startTimer();
      }
    } catch {
      // Silent fail - user can manually restart
    }
  }, [
    activeSession,
    addPositionToActiveSession,
    requestPermissions,
    startTimer,
  ]);

  // Subscribe to native events
  useEffect(() => {
    console.log("[WalkingSession] Setting up event listeners");

    const unsubscribeSteps = WalkingTrackingService.onStepUpdate((event) => {
      console.log("[WalkingSession] ✅ Step event:", JSON.stringify(event));
      updateActiveSession({
        steps: event.steps,
        distanceKm: event.distance,
      });
    });

    const unsubscribeLocation = WalkingTrackingService.onLocationUpdate(
      (event) => {
        console.log(
          "[WalkingSession] ✅ Location event:",
          event.latitude,
          event.longitude,
        );
        addPositionToActiveSession({
          latitude: event.latitude,
          longitude: event.longitude,
        });
      },
    );

    const unsubscribeError = WalkingTrackingService.onError((event) => {
      console.log("[WalkingSession] ❌ Error event:", event.message);
      setErrorMessage(event.message);
    });

    return () => {
      console.log("[WalkingSession] Cleaning up event listeners");
      unsubscribeSteps();
      unsubscribeLocation();
      unsubscribeError();
    };
  }, [addPositionToActiveSession, updateActiveSession]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      console.log(
        "[WalkingSession] AppState changed from",
        appStateRef.current,
        "to",
        nextState,
      );
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        console.log(
          "[WalkingSession] App returned to foreground, resuming tracking",
        );
        void resumeTrackingIfNeeded();
      }
      appStateRef.current = nextState;
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [resumeTrackingIfNeeded]);

  // Resume on mount if there's an active session
  useEffect(() => {
    void resumeTrackingIfNeeded();
  }, [resumeTrackingIfNeeded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, [stopTimer]);

  // Calculate distance from positions
  const distanceKm = useMemo(() => {
    const calculatedDistance = calculateDistanceKm(positions);
    // Use the greater of calculated distance or step-based distance
    return Math.max(calculatedDistance, activeSession?.distanceKm ?? 0);
  }, [positions, activeSession?.distanceKm]);

  const stats = useMemo(
    () => [
      {
        key: "steps",
        label: t("walking.stats.steps"),
        value: steps.toLocaleString(),
      },
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
    ],
    [t, steps, distanceKm, elapsedMs],
  );

  return {
    // State
    status,
    errorMessage,
    steps,
    positions,
    distanceKm,
    elapsedMs,
    stats,

    // Actions
    startTracking,
    stopTracking,
  };
};
