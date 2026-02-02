import React, { useEffect, useMemo, useRef, useState } from "react";
import { View } from "react-native";
import { WebView, type WebViewMessageEvent } from "react-native-webview";

import { useThemeColor } from "@/hooks/useThemeColor";

import styles from "./MapView.styles";
import type { MapViewProps } from "./MapView.types";

const TILE_LAYER_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

const createHtml = (
  accentColor: string,
  strokeColor: string,
) => `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta name="viewport" content="initial-scale=1, maximum-scale=1" />
    <link
      rel="stylesheet"
      href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    />
    <style>
      html, body, #map { height: 100%; margin: 0; padding: 0; }
      #map { background: #0b1220; }
      .leaflet-container { background: #0b1220; }
    </style>
  </head>
  <body>
    <div id="map" aria-label="Map preview"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const map = L.map('map');
      L.tileLayer('${TILE_LAYER_URL}', { maxZoom: 19 }).addTo(map);

      let pathLine = L.polyline([], { color: '${accentColor}', weight: 5 }).addTo(map);
      let marker = null;

      function updatePath(path) {
        if (!Array.isArray(path) || path.length === 0) {
          map.setView([0, 0], 2);
          pathLine.setLatLngs([]);
          if (marker) {
            marker.remove();
            marker = null;
          }
          return;
        }

        const latLngs = path.map((p) => [p.latitude, p.longitude]);
        pathLine.setLatLngs(latLngs);
        const last = latLngs[latLngs.length - 1];

        if (!marker) {
          marker = L.circleMarker(last, { radius: 8, color: '${strokeColor}', fillColor: '${accentColor}', fillOpacity: 0.9 }).addTo(map);
        } else {
          marker.setLatLng(last);
        }

        const bounds = pathLine.getBounds();
        if (bounds && bounds.isValid()) {
          map.fitBounds(bounds, { padding: [24, 24] });
        } else {
          map.setView(last, 16);
        }
      }

      window.updatePath = updatePath;
      updatePath([]);
      setTimeout(() => {
        if (window.ReactNativeWebView) {
          window.ReactNativeWebView.postMessage('ready');
        }
      }, 10);
    </script>
  </body>
</html>`;

const MapViewNative: React.FC<MapViewProps> = ({
  positions,
  style,
  onReady,
}) => {
  const accentColor = useThemeColor({}, "tint") ?? "#22c55e";
  const strokeColor = useThemeColor({}, "text") ?? accentColor;
  const webViewRef = useRef<WebView>(null);
  const [isReady, setIsReady] = useState(false);

  const html = useMemo(
    () => createHtml(accentColor, strokeColor),
    [accentColor, strokeColor],
  );

  const handleMessage = (event: WebViewMessageEvent) => {
    if (event.nativeEvent.data === "ready") {
      setIsReady(true);
      onReady?.();
    }
  };

  useEffect(() => {
    if (!isReady || !webViewRef.current) return;
    const serialized = JSON.stringify(positions);
    webViewRef.current.injectJavaScript(
      `(function(){ if (window.updatePath) { window.updatePath(${serialized}); } })(); true;`,
    );
  }, [isReady, positions]);

  return (
    <View style={[styles.container, style]}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        onMessage={handleMessage}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
};

export default MapViewNative;
