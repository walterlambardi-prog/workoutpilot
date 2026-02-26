/**
 * useSyncInitialization Hook
 *
 * Manages Supabase sync lifecycle:
 * - Initial data load on app start (if authenticated)
 * - Background sync when app returns to foreground
 * - Queue flush when network connection is restored
 * - Automatic retry for failed syncs
 *
 * Usage: Call in app/_layout.tsx root component
 */

import { useEffect, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import { useAuthStore } from "@/stores/authStore";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { useStepTrackerStore } from "@/stores/stepTrackerStore";
import { syncService } from "@/utils/syncService";

export type SyncInitStatus = "idle" | "loading" | "syncing" | "ready" | "error";

interface UseSyncInitializationResult {
  syncStatus: SyncInitStatus;
  isReady: boolean;
  error: string | null;
  retrySync: () => Promise<void>;
}

/** Max time (ms) to wait for initial sync before unblocking the UI */
const SYNC_TIMEOUT_MS = 10_000;

export const useSyncInitialization = (): UseSyncInitializationResult => {
  const [syncStatus, setSyncStatus] = useState<SyncInitStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const user = useAuthStore((state: { user: any }) => state.user);
  const hasHydrated = useAuthStore(
    (state: { _hasHydrated: boolean }) => state._hasHydrated,
  );

  // ============================================================
  // Initial Sync: Load data from Supabase on app start
  // ============================================================
  useEffect(() => {
    if (!hasHydrated || !user || syncStatus !== "idle") {
      return;
    }

    const loadInitialData = async () => {
      setSyncStatus("loading");
      setError(null);

      try {
        console.log("[SyncInit] 🔄 Loading initial data from Supabase...");

        // Load full history from Supabase
        const history = await syncService.loadFullHistory();

        // Hydrate stores with Supabase data
        useExerciseSessionStore.setState({ history: history.exerciseSessions });
        useRoutineSessionStore.setState({ history: history.routineSessions });
        useStepTrackerStore.setState({
          history: history.stepTrackerSessions,
        });

        console.log("[SyncInit] ✅ Initial sync complete:", {
          exerciseSessions: history.exerciseSessions.length,
          routineSessions: history.routineSessions.length,
          stepTrackerSessions: history.stepTrackerSessions.length,
        });

        setSyncStatus("ready");
      } catch (err) {
        console.error("[SyncInit] ❌ Initial sync failed:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Failed to sync data from server",
        );
        setSyncStatus("error");

        // Continue with local data (offline-first)
        // No need to block the app
      }
    };

    void loadInitialData();
  }, [user, hasHydrated, syncStatus]);

  // ============================================================
  // Safety timeout: unblock the UI if sync takes too long
  // (e.g. slow / no network where fetch hangs without timing out)
  // ============================================================
  useEffect(() => {
    if (syncStatus !== "loading" && syncStatus !== "syncing") return;

    const timer = setTimeout(() => {
      console.warn(
        "[SyncInit] ⏱ Sync timed out after",
        SYNC_TIMEOUT_MS,
        "ms — unblocking UI",
      );
      setSyncStatus("error");
      setError("Sync timed out");
    }, SYNC_TIMEOUT_MS);

    return () => clearTimeout(timer);
  }, [syncStatus]);

  // ============================================================
  // AppState Listener: Flush queue when app returns to foreground
  // ============================================================
  useEffect(() => {
    if (!user) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log(
          "[SyncInit] 🔄 App became active, flushing pending queue...",
        );
        void syncService.flushQueue();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );

    return () => {
      subscription.remove();
    };
  }, [user]);

  // ============================================================
  // Manual Retry
  // ============================================================
  const retrySync = async () => {
    if (!user) {
      setError("No authenticated user");
      return;
    }

    setSyncStatus("syncing");
    setError(null);

    try {
      console.log("[SyncInit] 🔄 Manual retry sync...");

      // Flush pending queue
      await syncService.flushQueue();

      // Reload history
      const history = await syncService.loadFullHistory();
      useExerciseSessionStore.setState({ history: history.exerciseSessions });
      useRoutineSessionStore.setState({ history: history.routineSessions });
      useStepTrackerStore.setState({ history: history.stepTrackerSessions });

      setSyncStatus("ready");
      console.log("[SyncInit] ✅ Manual sync complete");
    } catch (err) {
      console.error("[SyncInit] ❌ Manual sync failed:", err);
      setError(
        err instanceof Error ? err.message : "Failed to sync data from server",
      );
      setSyncStatus("error");
    }
  };

  return {
    syncStatus,
    isReady: syncStatus === "ready" || syncStatus === "error", // Don't block app on error
    error,
    retrySync,
  };
};
