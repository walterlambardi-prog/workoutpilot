import { NativeEventEmitter, NativeModules, Platform } from "react-native";

const LINKING_ERROR =
  `The package 'StepTracker' doesn't seem to be linked. Make sure: \n\n` +
  Platform.select({ ios: "- You have run 'pod install'\n", default: "" }) +
  "- You rebuilt the app after installing the package\n" +
  "- You are not using Expo Go\n";

const StepTrackerNative = NativeModules.StepTracker
  ? NativeModules.StepTracker
  : new Proxy(
      {},
      {
        get() {
          throw new Error(LINKING_ERROR);
        },
      },
    );

const eventEmitter = new NativeEventEmitter(StepTrackerNative);

export interface PermissionStatus {
  motion: "granted" | "denied" | "unavailable" | "unknown";
  location: "granted" | "denied" | "unknown";
}

export interface StepUpdateEvent {
  steps: number;
  distance: number;
  timestamp: number;
}

export interface LocationUpdateEvent {
  latitude: number;
  longitude: number;
  accuracy: number;
  altitude: number;
  speed: number;
  timestamp: number;
}

export interface PendingPosition {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

export interface ErrorEvent {
  message: string;
  code?: number;
}

export interface TrackingResult {
  success: boolean;
  message: string;
}

export interface TrackingStatusResult {
  isTracking: boolean;
}

type EventCallback<T> = (event: T) => void;

class StepTrackerService {
  private listeners: Map<string, any> = new Map();

  /**
   * Request necessary permissions for tracking
   */
  async requestPermissions(): Promise<PermissionStatus> {
    return StepTrackerNative.requestPermissions();
  }

  /**
   * Start tracking steps and location
   */
  async startTracking(): Promise<TrackingResult> {
    return StepTrackerNative.startTracking();
  }

  /**
   * Stop tracking
   */
  async stopTracking(): Promise<TrackingResult> {
    return StepTrackerNative.stopTracking();
  }

  /**
   * Check if currently tracking
   */
  async isTracking(): Promise<boolean> {
    const result: TrackingStatusResult = await StepTrackerNative.isTracking();
    return result.isTracking;
  }

  /**
   * Get pending positions (positions collected while in background)
   * Works on both iOS and Android
   */
  async getPendingPositions(): Promise<PendingPosition[]> {
    try {
      const positions = await StepTrackerNative.getPendingPositions();
      return Array.isArray(positions) ? positions : [];
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to step updates
   */
  onStepUpdate(callback: EventCallback<StepUpdateEvent>): () => void {
    const listener = eventEmitter.addListener("onStepUpdate", callback);
    this.listeners.set("onStepUpdate", listener);
    return () => {
      listener.remove();
      this.listeners.delete("onStepUpdate");
    };
  }

  /**
   * Subscribe to location updates
   */
  onLocationUpdate(callback: EventCallback<LocationUpdateEvent>): () => void {
    const listener = eventEmitter.addListener("onLocationUpdate", callback);
    this.listeners.set("onLocationUpdate", listener);
    return () => {
      listener.remove();
      this.listeners.delete("onLocationUpdate");
    };
  }

  /**
   * Subscribe to errors
   */
  onError(callback: EventCallback<ErrorEvent>): () => void {
    const listener = eventEmitter.addListener("onError", callback);
    this.listeners.set("onError", listener);
    return () => {
      listener.remove();
      this.listeners.delete("onError");
    };
  }

  /**
   * Subscribe to permission status changes
   */
  onPermissionStatusChange(
    callback: EventCallback<{ location: string }>,
  ): () => void {
    const listener = eventEmitter.addListener("onPermissionStatus", callback);
    this.listeners.set("onPermissionStatus", listener);
    return () => {
      listener.remove();
      this.listeners.delete("onPermissionStatus");
    };
  }

  /**
   * Remove all listeners
   */
  removeAllListeners(): void {
    this.listeners.forEach((listener) => listener.remove());
    this.listeners.clear();
  }
}

export default new StepTrackerService();
