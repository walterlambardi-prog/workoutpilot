import type { ViewStyle } from "react-native";

export interface LatLng {
  latitude: number;
  longitude: number;
}

export interface MapViewProps {
  positions: LatLng[];
  /**
   * Optional container style override for native/web wrapper.
   */
  style?: ViewStyle;
  /**
   * Callback when the map is ready to receive updates.
   */
  onReady?: () => void;
}
