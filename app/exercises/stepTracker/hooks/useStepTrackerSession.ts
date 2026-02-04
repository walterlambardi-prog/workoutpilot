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
import { useStepTrackerStore } from "@/stores/stepTrackerStore";
import StepTrackerService from "@/utils/StepTrackerService";

import type { StepTrackerStatusKey } from "../stepTracker.types";

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

export const useStepTrackerSession = () => {
  const { t } = useTranslation();
  const [status, setStatus] = useState<StepTrackerStatusKey>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Use selectors to subscribe to store changes correctly
  const activeSession = useStepTrackerStore((state) => state.activeSession);
  const startActiveSession = useStepTrackerStore(
    (state) => state.startActiveSession,
  );
  const updateActiveSession = useStepTrackerStore(
    (state) => state.updateActiveSession,
  );
  const addPositionToActiveSession = useStepTrackerStore(
    (state) => state.addPositionToActiveSession,
  );
  const finalizeActiveSession = useStepTrackerStore(
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
        setErrorMessage(t("stepTracker.errors.permissionDenied"));
        return false;
      }

      // Request background location for Android 10+ and iOS
      if (Platform.OS === "android" && Platform.Version >= 29) {
        const { status: backgroundStatus } =
          await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== "granted") {
          setErrorMessage(t("stepTracker.errors.backgroundPermissionDenied"));
          // Continue anyway, but warn user
        }
      } else if (Platform.OS === "ios") {
        // iOS handles "always" permission through the native module
        const permissions = await StepTrackerService.requestPermissions();
        if (permissions.location !== "granted") {
          setErrorMessage(t("stepTracker.errors.backgroundPermissionDenied"));
        }
      }

      // Request activity recognition permission (Android 10+)
      if (Platform.OS === "android" && Platform.Version >= 29) {
        console.log(
          "[StepTrackerSession] 📋 Requesting ACTIVITY_RECOGNITION permission...",
        );

        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACTIVITY_RECOGNITION,
          {
            title: t("stepTracker.permissions.activityTitle"),
            message: t("stepTracker.permissions.activityMessage"),
            buttonPositive: t("common.allow"),
          },
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          console.log(
            "[StepTrackerSession] ⚠️ ACTIVITY_RECOGNITION permission denied",
          );
          setErrorMessage(t("stepTracker.steps.unavailable"));
          // Allow to continue without step counting
        } else {
          console.log(
            "[StepTrackerSession] ✅ ACTIVITY_RECOGNITION permission granted",
          );
        }
      }

      // Check motion/activity permissions from native module
      const nativePermissions =
        await StepTrackerService.requestPermissions();

      console.log("[StepTrackerSession] 📋 Native permissions:", nativePermissions);

      if (nativePermissions.motion === "denied") {
        setErrorMessage(t("stepTracker.steps.unavailable"));
        // Allow to continue without step counting
      }

      return true;
    } catch (error) {
      console.log("[StepTrackerSession] ❌ Error requesting permissions:", error);
      setStatus("error");
      setErrorMessage(t("stepTracker.errors.permissionDenied"));
      return false;
    }
  }, [t]);

  const startTracking = useCallback(async () => {
    console.log("[StepTrackerSession] 🚀 Starting tracking...");

    const granted = await requestPermissions();
    if (!granted) {
      console.log("[StepTrackerSession] ❌ Permissions not granted");
      return;
    }

    try {
      // Initialize store session FIRST (before native events start arriving)
      console.log("[StepTrackerSession] 📝 Creating active session in store");
      startActiveSession();

      setErrorMessage(undefined);
      setStatus("tracking");
      startTimer();

      // Start native tracking (events will now update the active session)
      console.log("[StepTrackerSession] 📱 Starting native tracking module");
      const result = await StepTrackerService.startTracking();

      if (!result.success) {
        console.log(
          "[StepTrackerSession] ❌ Native tracking failed:",
          result.message,
        );
        setStatus("error");
        setErrorMessage(result.message);
        return;
      }

      console.log("[StepTrackerSession] ✅ Tracking started successfully");
    } catch (error) {
      console.log("[StepTrackerSession] ❌ Error starting tracking:", error);
      setStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : t("stepTracker.errors.unknown"),
      );
    }
  }, [requestPermissions, startActiveSession, startTimer, t]);

  const stopTracking = useCallback(async () => {
    try {
      await StepTrackerService.stopTracking();
      stopTimer();
      finalizeActiveSession();
      setStatus("paused");
      setElapsedMs(0);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : t("stepTracker.errors.unknown"),
      );
    }
  }, [finalizeActiveSession, stopTimer, t]);

  const resumeTrackingIfNeeded = useCallback(async () => {
    if (!activeSession) {
      console.log("[StepTrackerSession] No active session, skipping resume");
      return;
    }

    try {
      const isTracking = await StepTrackerService.isTracking();
      console.log("[StepTrackerSession] isTracking:", isTracking);

      if (isTracking) {
        console.log("[StepTrackerSession] Resuming tracking from background");
        setStatus("tracking");
        startTimer();

        // Retrieve pending positions collected while in background
        const pendingPositions =
          await StepTrackerService.getPendingPositions();
        console.log(
          "[StepTrackerSession] Retrieved pending positions:",
          pendingPositions.length,
        );

        if (pendingPositions.length > 0) {
          console.log("[StepTrackerSession] Adding pending positions to session");
          pendingPositions.forEach((pos, index) => {
            console.log(
              `[StepTrackerSession] Adding position ${index + 1}/${pendingPositions.length}:`,
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

      const result = await StepTrackerService.startTracking();
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
    console.log("[StepTrackerSession] Setting up event listeners");

    const unsubscribeSteps = StepTrackerService.onStepUpdate((event) => {
      console.log("[StepTrackerSession] ✅ Step event:", JSON.stringify(event));
      updateActiveSession({
        steps: event.steps,
        distanceKm: event.distance,
      });
    });

    const unsubscribeLocation = StepTrackerService.onLocationUpdate(
      (event) => {
        console.log(
          "[StepTrackerSession] ✅ Location event:",
          event.latitude,
          event.longitude,
        );
        addPositionToActiveSession({
          latitude: event.latitude,
          longitude: event.longitude,
        });
      },
    );

    const unsubscribeError = StepTrackerService.onError((event) => {
      console.log("[StepTrackerSession] ❌ Error event:", event.message);
      setErrorMessage(event.message);
    });

    return () => {
      console.log("[StepTrackerSession] Cleaning up event listeners");
      unsubscribeSteps();
      unsubscribeLocation();
      unsubscribeError();
    };
  }, [addPositionToActiveSession, updateActiveSession]);

  // Handle app state changes
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      console.log(
        "[StepTrackerSession] AppState changed from",
        appStateRef.current,
        "to",
        nextState,
      );
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        console.log(
          "[StepTrackerSession] App returned to foreground, resuming tracking",
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
        label: t("stepTracker.stats.steps"),
        value: steps.toLocaleString(),
      },
      {
        key: "distance",
        label: t("stepTracker.stats.distance"),
        value: t("stepTracker.stats.distanceValue", {
          distance: distanceKm.toFixed(2),
        }),
      },
      {
        key: "duration",
        label: t("stepTracker.stats.duration"),
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
