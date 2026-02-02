import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import * as TaskManager from "expo-task-manager";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useTranslation } from "react-i18next";
import { XStack, YStack } from "tamagui";

import MapView from "@/components/MapView";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { THeading, TText } from "@/components/TText";
import { TPage } from "@/components/TPage";
import type { LatLng } from "@/components/MapView/MapView.types";

import styles from "./walking.styles";
import type { WalkingStatusKey } from "./walking.types";

const BG_LOCATION_TASK = "walking-location-background";
const BG_STEPS_TASK = "walking-steps-background";
const STORAGE_KEYS = {
  positions: "walking:positions",
  start: "walking:start",
  steps: "walking:steps",
};

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
      Math.cos(lat1) * Math.cos(lat2) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const earthRadiusKm = 6371;
    distance += earthRadiusKm * c;
  }
  return distance;
};

const formatDuration = (durationMs: number) => {
  const totalSeconds = Math.max(0, Math.floor(durationMs / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
};

const WalkingScreen: React.FC = () => {
  const { t } = useTranslation();
  const [positions, setPositions] = useState<LatLng[]>([]);
  const [steps, setSteps] = useState<number | null>(null);
  const [status, setStatus] = useState<WalkingStatusKey>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [elapsedMs, setElapsedMs] = useState(0);
  const pedometerSubscriptionRef = useRef<ReturnType<typeof Pedometer.watchStepCount> | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    if (!TaskManager.isTaskDefined(BG_LOCATION_TASK)) {
      TaskManager.defineTask(
        BG_LOCATION_TASK,
        async (body: TaskManager.TaskManagerTaskBody | null) => {
          const error = body?.error as Error | undefined;
          const data = body?.data as { locations?: Location.LocationObject[] } | undefined;
          if (error) {
            return;
          }
          const locations = data?.locations;
          if (!locations || locations.length === 0) return;

          try {
            const stored = await AsyncStorage.getItem(STORAGE_KEYS.positions);
            const existing: LatLng[] = stored ? JSON.parse(stored) : [];
            const incoming: LatLng[] = locations.map((loc) => ({
              latitude: loc.coords.latitude,
              longitude: loc.coords.longitude,
            }));
            const next = [...existing, ...incoming];
            const trimmed = next.slice(-500); // prevent unbounded growth
            await AsyncStorage.setItem(STORAGE_KEYS.positions, JSON.stringify(trimmed));
          } catch {
            // ignore storage errors
          }
        },
      );
    }

    if (!TaskManager.isTaskDefined(BG_STEPS_TASK)) {
      TaskManager.defineTask(BG_STEPS_TASK, async (body: TaskManager.TaskManagerTaskBody | null) => {
        const error = body?.error as Error | undefined;
        if (error) {
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }

        try {
          const storedStart = await AsyncStorage.getItem(STORAGE_KEYS.start);
          if (!storedStart) return BackgroundFetch.BackgroundFetchResult.NoData;
          const parsedStart = Number(storedStart);
          if (Number.isNaN(parsedStart)) return BackgroundFetch.BackgroundFetchResult.NoData;

          const permission = await Pedometer.getPermissionsAsync();
          if (permission.status !== "granted") return BackgroundFetch.BackgroundFetchResult.NoData;

          const history = await Pedometer.getStepCountAsync(new Date(parsedStart), new Date());
          if (history && typeof history.steps === "number") {
            await AsyncStorage.setItem(STORAGE_KEYS.steps, `${history.steps}`);
            return BackgroundFetch.BackgroundFetchResult.NewData;
          }
          return BackgroundFetch.BackgroundFetchResult.NoData;
        } catch {
          return BackgroundFetch.BackgroundFetchResult.Failed;
        }
      });
    }
  }, []);

  const resetState = useCallback(() => {
    setPositions([]);
    setSteps(null);
    setElapsedMs(0);
    setErrorMessage(undefined);
  }, []);

  const stopSubscriptions = useCallback(() => {
    pedometerSubscriptionRef.current?.remove();
    pedometerSubscriptionRef.current = null;
    locationSubscriptionRef.current?.remove();
    locationSubscriptionRef.current = null;
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    void Location.stopLocationUpdatesAsync(BG_LOCATION_TASK).catch(() => undefined);
  }, []);

  const stopTracking = useCallback(() => {
    stopSubscriptions();
    setStatus("paused");
    void BackgroundFetch.unregisterTaskAsync(BG_STEPS_TASK).catch(() => undefined);
  }, [stopSubscriptions]);

  const requestPermissions = useCallback(async () => {
    setStatus("requesting");
    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== Location.PermissionStatus.GRANTED) {
      setStatus("error");
      setErrorMessage(t("walking.errors.permissionDenied"));
      return false;
    }
    return true;
  }, [t]);

  const syncElapsed = useCallback(() => {
    if (startTimestampRef.current) {
      setElapsedMs(Date.now() - startTimestampRef.current);
    }
  }, []);

  const loadSessionStart = useCallback(async () => {
    if (startTimestampRef.current) return;
    try {
      const storedStart = await AsyncStorage.getItem(STORAGE_KEYS.start);
      if (storedStart) {
        const parsed = Number(storedStart);
        if (!Number.isNaN(parsed)) {
          startTimestampRef.current = parsed;
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const persistSteps = useCallback(async (value: number) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.steps, `${value}`);
    } catch {
      // ignore
    }
  }, []);

  const loadStoredSteps = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.steps);
      if (!stored) return;
      const parsed = Number(stored);
      if (!Number.isNaN(parsed)) {
        setSteps(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  const startTimer = useCallback(() => {
    startTimestampRef.current = Date.now();
    syncElapsed();
    timerRef.current = setInterval(syncElapsed, 1000);
  }, [syncElapsed]);

  const refreshStepsFromHistory = useCallback(async () => {
    if (!startTimestampRef.current) {
      await loadSessionStart();
    }
    if (!startTimestampRef.current) return;

    try {
      const permission = await Pedometer.getPermissionsAsync();
      if (permission.status !== "granted") return;

      const now = new Date();
      const start = new Date(startTimestampRef.current);
      const history = await Pedometer.getStepCountAsync(start, now);
      if (history && typeof history.steps === "number") {
        setSteps((prev) => {
          if (prev === null || prev === undefined) return history.steps;
          return Math.max(prev, history.steps);
        });
        await persistSteps(history.steps);
      }
    } catch {
      // Ignore history errors (e.g., not supported) and keep live subscription.
    }
  }, [loadSessionStart, persistSteps]);

  const loadBackgroundPositions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.positions);
      if (!stored) return;
      const parsed: LatLng[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setPositions((prev) => {
        if (prev.length === 0) return parsed;
        const merged = [...prev];
        parsed.forEach((p) => {
          const last = merged[merged.length - 1];
          if (!last || last.latitude !== p.latitude || last.longitude !== p.longitude) {
            merged.push(p);
          }
        });
        return merged;
      });
      await AsyncStorage.removeItem(STORAGE_KEYS.positions);
    } catch {
      // ignore parse errors
    }
  }, []);

  const startPedometer = useCallback(async () => {
    const { status: pedometerStatus } = await Pedometer.requestPermissionsAsync();
    if (pedometerStatus !== "granted") {
      setSteps(null);
      setErrorMessage(t("walking.errors.permissionDenied"));
      return false;
    }

    const available = await Pedometer.isAvailableAsync();
    if (!available) {
      setSteps(null);
      setErrorMessage(t("walking.steps.unavailable"));
      return false;
    }

    pedometerSubscriptionRef.current = Pedometer.watchStepCount((result) => {
      setSteps(result.steps);
      void persistSteps(result.steps);
      // Reconcile with history to prevent resets after background.
      void refreshStepsFromHistory();
    });
    // Backfill any steps accrued while the app was backgrounded or before subscription starts.
    void refreshStepsFromHistory();
    return true;
  }, [persistSteps, refreshStepsFromHistory, t]);

  const ensureStepsBackgroundTask = useCallback(async () => {
    try {
      const status = await BackgroundFetch.getStatusAsync();
      if (
        status === BackgroundFetch.BackgroundFetchStatus.Restricted ||
        status === BackgroundFetch.BackgroundFetchStatus.Denied
      ) {
        return false;
      }

      const isRegistered = await TaskManager.isTaskRegisteredAsync(BG_STEPS_TASK);
      if (!isRegistered) {
        await BackgroundFetch.registerTaskAsync(BG_STEPS_TASK, {
          minimumInterval: 300,
          stopOnTerminate: false,
          startOnBoot: false,
        });
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  const startLocationTracking = useCallback(async () => {
    try {
      // Foreground updates for immediate UI responsiveness
      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Highest,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (update) => {
          const { latitude, longitude } = update.coords;
          setPositions((prev) => [...prev, { latitude, longitude }]);
        },
      );

      // Background updates for route/distance while app is backgrounded
      await Location.startLocationUpdatesAsync(BG_LOCATION_TASK, {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000,
        distanceInterval: 5,
        showsBackgroundLocationIndicator: true,
        foregroundService: {
          notificationTitle: "Walking tracker",
          notificationBody: "Tracking your route and distance.",
          notificationColor: "#0A84FF",
        },
      });
      return true;
    } catch {
      setStatus("error");
      setErrorMessage(t("walking.errors.permissionDenied"));
      return false;
    }
  }, [t]);

  const startTracking = useCallback(async () => {
    const granted = await requestPermissions();
    if (!granted) return;

    const { status: bgStatus } = await Location.requestBackgroundPermissionsAsync();
    if (bgStatus !== Location.PermissionStatus.GRANTED) {
      setStatus("error");
      setErrorMessage(t("walking.errors.permissionDenied"));
      return;
    }

    resetState();
    stopSubscriptions();
    startTimer();
    await AsyncStorage.setItem(STORAGE_KEYS.start, `${startTimestampRef.current ?? Date.now()}`);
    await AsyncStorage.removeItem(STORAGE_KEYS.positions);
    await AsyncStorage.removeItem(STORAGE_KEYS.steps);
    await startPedometer();
    void ensureStepsBackgroundTask();
    const locationStarted = await startLocationTracking();
    if (locationStarted) {
      setStatus("tracking");
    }
  }, [ensureStepsBackgroundTask, requestPermissions, resetState, startLocationTracking, startPedometer, startTimer, stopSubscriptions, t]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (appStateRef.current.match(/inactive|background/) && nextState === "active") {
        void loadSessionStart().then(() => {
          syncElapsed();
          void refreshStepsFromHistory();
          void loadStoredSteps();
          void loadBackgroundPositions();
        });
      }
      appStateRef.current = nextState;
    };

    const subscription = AppState.addEventListener("change", handleAppStateChange);
    return () => {
      subscription.remove();
    };
  }, [loadBackgroundPositions, loadSessionStart, loadStoredSteps, refreshStepsFromHistory, syncElapsed]);

  useEffect(() => {
    void loadSessionStart().then(() => {
      syncElapsed();
      void refreshStepsFromHistory();
      void loadStoredSteps();
      void loadBackgroundPositions();
    });
  }, [loadBackgroundPositions, loadSessionStart, loadStoredSteps, refreshStepsFromHistory, syncElapsed]);

  useEffect(() => {
    return () => {
      stopTracking();
      stopSubscriptions();
    };
  }, [stopSubscriptions, stopTracking]);

  const distanceKm = useMemo(() => calculateDistanceKm(positions), [positions]);
  const statusLabel = t(`walking.status.${status}`);
  const primaryCtaLabel = status === "tracking"
    ? t("walking.actions.stop")
    : t("walking.actions.start");

  const stats = [
    {
      key: "steps",
      label: t("walking.stats.steps"),
      value:
        steps !== null && steps !== undefined
          ? steps.toLocaleString()
          : t("walking.steps.unavailable"),
    },
    {
      key: "distance",
      label: t("walking.stats.distance"),
      value: t("walking.stats.distanceValue", { distance: distanceKm.toFixed(2) }),
    },
    {
      key: "duration",
      label: t("walking.stats.duration"),
      value: formatDuration(elapsedMs),
    },
  ];

  return (
    <TPage scrollable hasHeader>
      <ScreenHeader
        title={t("walking.title")}
        subtitle={t("walking.subtitle")}
      />

      <TCard padding="$4" elevated>
        <YStack gap="$2">
          <TText variant="label">{t("walking.status.label")}</TText>
          <THeading level={3}>{statusLabel}</THeading>
          {errorMessage ? (
            <TText color={"$red10" as any}>
              {errorMessage}
            </TText>
          ) : null}
          <TButton onPress={status === "tracking" ? stopTracking : startTracking} iconName={status === "tracking" ? "pause" : "walk"}>
            {primaryCtaLabel}
          </TButton>
        </YStack>
      </TCard>

      <XStack gap="$3" flexWrap="wrap">
        {stats.map((stat) => (
          <TCard key={stat.key} padding="$4" style={styles.statCard}>
            <YStack gap="$1">
              <TText variant="label">{stat.label}</TText>
              <THeading level={3}>{stat.value}</THeading>
            </YStack>
          </TCard>
        ))}
      </XStack>

      <YStack gap="$2">
        <TText variant="label">{t("walking.map.title")}</TText>
        <TCard padding="$1" elevated>
          <MapView positions={positions} style={styles.mapWrapper} />
        </TCard>
      </YStack>
    </TPage>
  );
};

export default WalkingScreen;
