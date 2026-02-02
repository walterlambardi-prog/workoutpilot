import * as Location from "expo-location";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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

const WalkingWebScreen: React.FC = () => {
  const { t } = useTranslation();
  const [positions, setPositions] = useState<LatLng[]>([]);
  const [status, setStatus] = useState<WalkingStatusKey>("idle");
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [elapsedMs, setElapsedMs] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimestampRef = useRef<number | null>(null);
  const locationSubscriptionRef = useRef<Location.LocationSubscription | null>(null);
  const [isSecureContext, setIsSecureContext] = useState<boolean>(true);
  const browserWatchIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Ensure geolocation API is available in browsers; Expo polyfills on supported platforms.
    if (Location.installWebGeolocationPolyfill) {
      Location.installWebGeolocationPolyfill();
    }

    if (typeof window !== "undefined") {
      const secure = window.isSecureContext || window.location.hostname === "localhost";
      setIsSecureContext(secure);
    }
  }, []);

  const resetState = useCallback(() => {
    setPositions([]);
    setElapsedMs(0);
    setErrorMessage(undefined);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopSubscriptions = useCallback(() => {
    stopTimer();
    locationSubscriptionRef.current?.remove();
    locationSubscriptionRef.current = null;
    if (browserWatchIdRef.current !== null && typeof navigator !== "undefined" && navigator.geolocation?.clearWatch) {
      navigator.geolocation.clearWatch(browserWatchIdRef.current);
    }
    browserWatchIdRef.current = null;
  }, [stopTimer]);

  const stopTracking = useCallback(() => {
    stopSubscriptions();
    setStatus("paused");
  }, [stopSubscriptions]);

  const startTimer = useCallback(() => {
    startTimestampRef.current = Date.now();
    timerRef.current = setInterval(() => {
      if (startTimestampRef.current) {
        setElapsedMs(Date.now() - startTimestampRef.current);
      }
    }, 1000);
  }, []);

  const handlePosition = useCallback((position: GeolocationPosition) => {
    setPositions((prev) => [
      ...prev,
      {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    ]);
  }, []);

  const startBrowserTracking = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.geolocation) return false;

    return new Promise<boolean>((resolve) => {
      browserWatchIdRef.current = navigator.geolocation.watchPosition(
        (pos: GeolocationPosition) => {
          handlePosition(pos);
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            setStatus("error");
            setErrorMessage(t("walking.errors.permissionDenied"));
            return;
          }

          // Ignore transient unknown/unavailable errors; keep watching for a valid fix.
          if (error.code === error.POSITION_UNAVAILABLE || error.code === error.TIMEOUT) {
            console.warn("Transient location error", error);
            return;
          }

          setStatus("error");
          setErrorMessage(t("walking.errors.unavailable"));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 1000,
        },
      );

      resolve(true);
    });
  }, [handlePosition, t]);

  const startExpoTracking = useCallback(async () => {
    if (!isSecureContext) {
      setStatus("error");
      setErrorMessage(t("walking.errors.insecureContext"));
      return false;
    }

    const servicesEnabled = await Location.hasServicesEnabledAsync().catch(() => true);
    if (!servicesEnabled) {
      const fallbackStarted = await startBrowserTracking();
      if (fallbackStarted) return true;

      setStatus("error");
      setErrorMessage(t("walking.errors.servicesDisabled"));
      return false;
    }

    const { status: locationStatus } = await Location.requestForegroundPermissionsAsync();
    if (locationStatus !== Location.PermissionStatus.GRANTED) {
      setStatus("error");
      setErrorMessage(t("walking.errors.permissionDenied"));
      return false;
    }

    try {
      const initial = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      handlePosition({
        coords: initial.coords,
        timestamp: initial.timestamp,
      } as GeolocationPosition);

      locationSubscriptionRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,
          distanceInterval: 2,
        },
        (update) => {
          handlePosition({
            coords: update.coords,
            timestamp: update.timestamp,
          } as GeolocationPosition);
        },
      );
      return true;
    } catch (error) {
      const fallbackStarted = await startBrowserTracking();
      if (fallbackStarted) return true;

      console.warn("Location unavailable", error);
      setStatus("error");
      setErrorMessage(t("walking.errors.unavailable"));
      return false;
    }
  }, [handlePosition, isSecureContext, startBrowserTracking, t]);

  const startTracking = useCallback(async () => {
    resetState();
    stopSubscriptions();
    startTimer();
    setStatus("requesting");

    // Try browser API first for cases where Expo web location fails or is blocked.
    const started = (await startBrowserTracking()) || (await startExpoTracking());
    if (started) {
      setStatus("tracking");
    }
  }, [resetState, startBrowserTracking, startExpoTracking, startTimer, stopSubscriptions]);

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
        subtitle={t("walking.subtitleWeb")}
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

export default WalkingWebScreen;
