import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { Pedometer } from "expo-sensors";
import React, {
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import { useTranslation } from "react-i18next";
import { AppState, type AppStateStatus } from "react-native";
import { XStack, YStack } from "tamagui";

import MapView from "@/components/MapView";
import type { LatLng } from "@/components/MapView/MapView.types";
import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TPage } from "@/components/TPage";
import { THeading, TText } from "@/components/TText";
import { useWalkingSessionStore } from "@/stores/walkingSessionStore";

import styles from "./walking.styles";
import type { WalkingStatusKey } from "./walking.types";

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
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
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
  const statusRef = useRef<WalkingStatusKey>("idle");
  const pedometerBaselineRef = useRef<number | null>(null);
  const pedometerSubscriptionRef = useRef<ReturnType<
    typeof Pedometer.watchStepCount
  > | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(
    null,
  );
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);
  const addWalkingSession = useWalkingSessionStore((state) => state.addSession);

  const resetState = useCallback(() => {
    setPositions([]);
    setSteps(0);
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
  }, []);

  const requestPermissions = useCallback(async () => {
    setStatus("requesting");
    const { status: locationStatus } =
      await Location.requestForegroundPermissionsAsync();
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

  const loadSessionStart = useCallback(async (): Promise<number | null> => {
    if (startTimestampRef.current) return startTimestampRef.current;
    try {
      const storedStart = await AsyncStorage.getItem(STORAGE_KEYS.start);
      if (storedStart) {
        const parsed = Number(storedStart);
        if (!Number.isNaN(parsed)) {
          startTimestampRef.current = parsed;
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return null;
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

  const getStoredStepsValue = useCallback(
    async (preferStorage = false): Promise<number | null> => {
      if (!preferStorage && steps !== null && steps !== undefined) return steps;
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEYS.steps);
        if (!stored) return preferStorage ? 0 : null;
        const parsed = Number(stored);
        if (!Number.isNaN(parsed)) return parsed;
      } catch {
        // ignore
      }
      return preferStorage ? 0 : (steps ?? null);
    },
    [steps],
  );

  const startTimer = useCallback(
    (startTime?: number) => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }

      startTimestampRef.current = startTime ?? Date.now();
      syncElapsed();
      timerRef.current = setInterval(syncElapsed, 1000);
    },
    [syncElapsed],
  );

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
        setSteps(history.steps);
        pedometerBaselineRef.current = 0;
        await persistSteps(history.steps);
      }
    } catch {
      // Ignore history errors (e.g., not supported) and keep live subscription.
    }
  }, [loadSessionStart, persistSteps]);

  const loadStoredPositions = useCallback(async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.positions);
      if (!stored) return;
      const parsed: LatLng[] = JSON.parse(stored);
      if (!Array.isArray(parsed) || parsed.length === 0) return;
      setPositions((prev) => {
        const merged = prev.length === 0 ? [...parsed] : [...prev];
        parsed.forEach((p) => {
          const last = merged[merged.length - 1];
          if (
            !last ||
            last.latitude !== p.latitude ||
            last.longitude !== p.longitude
          ) {
            merged.push(p);
          }
        });
        return merged.slice(-750);
      });
    } catch {
      // ignore parse errors
    }
  }, []);

  const mergePositions = useCallback(async (): Promise<LatLng[]> => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.positions);
      const storedPositions: LatLng[] = stored ? JSON.parse(stored) : [];
      const merged = [...positions];
      storedPositions.forEach((p) => {
        const last = merged[merged.length - 1];
        if (
          !last ||
          last.latitude !== p.latitude ||
          last.longitude !== p.longitude
        ) {
          merged.push(p);
        }
      });
      return merged.slice(-750);
    } catch {
      return positions;
    }
  }, [positions]);

  const stopTracking = useCallback(() => {
    const finalize = async () => {
      stopSubscriptions();

      const startedAt = startTimestampRef.current;
      if (!startedAt) {
        setStatus("paused");
        return;
      }

      const [path, storedSteps] = await Promise.all([
        mergePositions(),
        getStoredStepsValue(),
      ]);

      const endedAt = Date.now();
      const stepsValue = storedSteps ?? 0;
      const durationMs =
        elapsedMs > 0 ? elapsedMs : Math.max(0, endedAt - startedAt);
      const distanceKm = calculateDistanceKm(path);

      if (stepsValue > 0 || path.length > 0) {
        addWalkingSession({
          startedAt,
          endedAt,
          durationMs,
          steps: stepsValue,
          distanceKm,
          positions: path,
        });
      }

      startTimestampRef.current = null;
      pedometerBaselineRef.current = null;
      await AsyncStorage.multiRemove([
        STORAGE_KEYS.start,
        STORAGE_KEYS.positions,
        STORAGE_KEYS.steps,
      ]);
      setStatus("paused");
    };

    void finalize();
  }, [
    addWalkingSession,
    elapsedMs,
    getStoredStepsValue,
    mergePositions,
    stopSubscriptions,
  ]);

  const finalizeLingeringSession = useCallback(async () => {
    const startedAt = await loadSessionStart();
    if (!startedAt || statusRef.current === "tracking") return;

    const [path, storedSteps] = await Promise.all([
      mergePositions(),
      getStoredStepsValue(true),
    ]);

    const endedAt = Date.now();
    const durationMs = Math.max(0, endedAt - startedAt);
    const stepsValue = storedSteps ?? 0;

    if (stepsValue > 0 || path.length > 0 || durationMs > 60000) {
      addWalkingSession({
        startedAt,
        endedAt,
        durationMs,
        steps: stepsValue,
        distanceKm: calculateDistanceKm(path),
        positions: path,
      });
    }

    startTimestampRef.current = null;
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.start,
      STORAGE_KEYS.positions,
      STORAGE_KEYS.steps,
    ]);
    resetState();
    setStatus("paused");
  }, [
    addWalkingSession,
    getStoredStepsValue,
    loadSessionStart,
    mergePositions,
    resetState,
  ]);

  const startPedometer = useCallback(async () => {
    const { status: pedometerStatus } =
      await Pedometer.requestPermissionsAsync();
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
      if (pedometerBaselineRef.current === null) {
        pedometerBaselineRef.current = result.steps;
      }
      const relativeSteps = Math.max(
        0,
        result.steps - (pedometerBaselineRef.current ?? 0),
      );
      setSteps(relativeSteps);
      void persistSteps(relativeSteps);
      // Reconcile with history to prevent resets after background.
      void refreshStepsFromHistory();
    });
    // Backfill any steps accrued while the app was backgrounded or before subscription starts.
    void refreshStepsFromHistory();
    return true;
  }, [persistSteps, refreshStepsFromHistory, t]);

  const ensureResumePermissions = useCallback(async () => {
    const foreground = await Location.getForegroundPermissionsAsync();
    if (foreground.status !== Location.PermissionStatus.GRANTED) {
      const { status: fgStatus } =
        await Location.requestForegroundPermissionsAsync();
      if (fgStatus !== Location.PermissionStatus.GRANTED) {
        setStatus("error");
        setErrorMessage(t("walking.errors.permissionDenied"));
        return false;
      }
    }
    return true;
  }, [t]);

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
          setPositions((prev) => {
            const last = prev[prev.length - 1];
            if (
              last &&
              last.latitude === latitude &&
              last.longitude === longitude
            ) {
              return prev;
            }
            const next = [...prev, { latitude, longitude }];
            const trimmed = next.slice(-750);
            void AsyncStorage.setItem(
              STORAGE_KEYS.positions,
              JSON.stringify(trimmed),
            ).catch(() => undefined);
            return trimmed;
          });
        },
      );
      return true;
    } catch {
      setStatus("error");
      setErrorMessage(t("walking.errors.permissionDenied"));
      return false;
    }
  }, [t]);

  const startTracking = useCallback(async () => {
    await finalizeLingeringSession();
    const granted = await requestPermissions();
    if (!granted) return;

    resetState();
    // Fully stop existing foreground/background watchers before starting fresh.
    stopSubscriptions();
    pedometerBaselineRef.current = null;
    startTimer();
    setErrorMessage(undefined);
    setStatus("tracking");
    const now = startTimestampRef.current ?? Date.now();
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.start,
      STORAGE_KEYS.positions,
      STORAGE_KEYS.steps,
    ]);
    await AsyncStorage.setItem(STORAGE_KEYS.start, `${now}`);
    await AsyncStorage.removeItem(STORAGE_KEYS.steps);
    const pedometerStarted = await startPedometer();
    if (!pedometerStarted) {
      // Steps may be unavailable; continue to track distance/time.
      setErrorMessage((prev) => prev ?? t("walking.steps.unavailable"));
    }
    const locationStarted = await startLocationTracking();
    if (locationStarted) {
      setStatus("tracking");
    } else {
      stopSubscriptions();
      setStatus("error");
    }
  }, [
    finalizeLingeringSession,
    requestPermissions,
    resetState,
    startLocationTracking,
    startPedometer,
    startTimer,
    stopSubscriptions,
    t,
  ]);

  const resumeTrackingIfNeeded = useCallback(async () => {
    const existingStart = await loadSessionStart();
    if (!existingStart) return;

    if (statusRef.current === "tracking") {
      syncElapsed();
      await Promise.all([
        refreshStepsFromHistory(),
        loadStoredSteps(),
        loadStoredPositions(),
      ]);
      return;
    }

    const permissionsOk = await ensureResumePermissions();
    if (!permissionsOk) return;

    setErrorMessage(undefined);
    setStatus("tracking");
    startTimer(existingStart);

    await Promise.all([
      refreshStepsFromHistory(),
      loadStoredSteps(),
      loadStoredPositions(),
    ]);

    const pedometerStarted = await startPedometer();
    if (!pedometerStarted) {
      setErrorMessage((prev) => prev ?? t("walking.steps.unavailable"));
    }

    const locationStarted = await startLocationTracking();
    if (!locationStarted) {
      setStatus("error");
    }
  }, [
    ensureResumePermissions,
    loadStoredPositions,
    loadSessionStart,
    loadStoredSteps,
    refreshStepsFromHistory,
    startLocationTracking,
    startPedometer,
    startTimer,
    syncElapsed,
    t,
  ]);

  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
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

  useEffect(() => {
    void resumeTrackingIfNeeded();
  }, [resumeTrackingIfNeeded]);

  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  useEffect(() => {
    return () => {
      stopSubscriptions();
    };
  }, [stopSubscriptions]);

  const distanceKm = useMemo(() => calculateDistanceKm(positions), [positions]);
  const statusLabel = t(`walking.status.${status}`);
  const primaryCtaLabel =
    status === "tracking"
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

  return (
    <TPage scrollable hasHeader>
      <ScreenHeader
        title={t("walking.title")}
        subtitle={t("walking.subtitle")}
      />

      <TCard padding="$4">
        <YStack gap="$2">
          <TText variant="label">{t("walking.status.label")}</TText>
          <THeading level={3}>{statusLabel}</THeading>
          {errorMessage ? (
            <TText color={"$red10" as any}>{errorMessage}</TText>
          ) : null}
          <TButton
            onPress={status === "tracking" ? stopTracking : startTracking}
            iconName={status === "tracking" ? "pause" : "walk"}
          >
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
        <TCard padding="$1">
          <MapView positions={positions} style={styles.mapWrapper} />
        </TCard>
      </YStack>
    </TPage>
  );
};

export default WalkingScreen;
