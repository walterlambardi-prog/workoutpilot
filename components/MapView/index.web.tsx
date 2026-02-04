import type { LatLngExpression } from "leaflet";
import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { View } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

import styles from "./MapView.styles";
import type { MapViewProps } from "./MapView.types";

const DEFAULT_CENTER: LatLngExpression = [0, 0];

const MapViewWeb: React.FC<MapViewProps> = ({ positions, style, onReady }) => {
  const { t } = useTranslation();
  const [isClient, setIsClient] = useState(false);
  const [leafletModules, setLeafletModules] = useState<{
    MapContainer: (typeof import("react-leaflet"))["MapContainer"];
    TileLayer: (typeof import("react-leaflet"))["TileLayer"];
    Polyline: (typeof import("react-leaflet"))["Polyline"];
    CircleMarker: (typeof import("react-leaflet"))["CircleMarker"];
  } | null>(null);
  const accentColor = useThemeColor({}, "tint") ?? "#22c55e";
  const strokeColor = useThemeColor({}, "text") ?? accentColor;

  useEffect(() => {
    let mounted = true;

    const loadLeaflet = async () => {
      if (typeof window === "undefined") return;

      // Inject stylesheet once (avoid Metro bundling CSS on web build)
      const cssId = "leaflet-css";
      if (!document.getElementById(cssId)) {
        const link = document.createElement("link");
        link.id = cssId;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      const rl = await import("react-leaflet");

      if (mounted) {
        setLeafletModules({
          MapContainer: rl.MapContainer,
          TileLayer: rl.TileLayer,
          Polyline: rl.Polyline,
          CircleMarker: rl.CircleMarker,
        });
        setIsClient(true);
        onReady?.();
      }
    };

    void loadLeaflet();

    return () => {
      mounted = false;
    };
  }, [onReady]);

  const path = useMemo<LatLngExpression[]>(
    () => positions.map((point) => [point.latitude, point.longitude]),
    [positions],
  );

  const center = path[path.length - 1] ?? DEFAULT_CENTER;
  const hasPath = path.length > 0;
  const zoom = hasPath ? 16 : 2;

  if (!isClient || !leafletModules) return null;

  const { MapContainer, TileLayer, Polyline, CircleMarker } = leafletModules;

  return (
    <View style={[styles.container, style]}>
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom
        style={styles.map}
        aria-label={t("stepTracker.map.ariaLabel")}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {hasPath ? (
          <>
            <Polyline
              positions={path}
              pathOptions={{ color: accentColor, weight: 5 }}
            />
            <CircleMarker
              center={path[path.length - 1]}
              radius={8}
              pathOptions={{
                color: strokeColor,
                fillColor: accentColor,
                fillOpacity: 0.9,
              }}
            />
          </>
        ) : null}
      </MapContainer>
    </View>
  );
};

export default MapViewWeb;
