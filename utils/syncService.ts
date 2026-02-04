/**
 * Supabase Sync Service
 *
 * Dual-Layer Storage: Local-First with Intelligent Sync
 *
 * Strategy:
 * - Active sessions: Write to AsyncStorage only (performance)
 * - Completed sessions: Sync to Supabase immediately
 * - Failed syncs: Queue for retry when online
 * - History loading: Supabase → AsyncStorage (cache)
 *
 * Resource Optimization:
 * - NO real-time sync during active sessions
 * - Batch operations when possible
 * - Network state awareness
 * - Silent failures with queue retry
 */

import type { RoutineAnalysisResponse } from "@/app/routineAnalysis/routineAnalysis.types";
import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores/authStore";
import type { ExerciseSessionEntry } from "@/stores/exerciseSessionStore";
import type { RoutineSession } from "@/stores/routineSessionStore";
import type { StepTrackerSessionEntry } from "@/stores/stepTrackerStore";
import {
  mapFromExerciseSession,
  mapFromRoutineAnalysis,
  mapFromRoutineSession,
  mapFromStepTrackerSession,
  mapToExerciseSession,
  mapToRoutineAnalysis,
  mapToRoutineSession,
  mapToStepTrackerSession,
} from "@/types/supabase.types";

export type SyncStatus = "idle" | "syncing" | "success" | "error";

interface SyncQueue {
  exerciseSessions: ExerciseSessionEntry[];
  routineSessions: RoutineSession[];
  stepTrackerSessions: StepTrackerSessionEntry[];
}

interface SyncResult {
  success: boolean;
  error?: string;
}

class SyncService {
  private queue: SyncQueue = {
    exerciseSessions: [],
    routineSessions: [],
    stepTrackerSessions: [],
  };

  private status: SyncStatus = "idle";
  private lastSyncAt: number | null = null;

  // ============================================================
  // Exercise Sessions
  // ============================================================

  /**
   * Sync a completed exercise session to Supabase
   * Called when: endSession()
   *
   * @param session Completed exercise session
   * @returns Promise<SyncResult>
   */
  async syncExerciseSession(
    session: ExerciseSessionEntry,
  ): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, queuing exercise session");
      this.queue.exerciseSessions.push(session);
      return { success: false, error: "No authenticated user" };
    }

    try {
      const insert = mapFromExerciseSession(session, user.id);

      const { error } = await supabase
        .from("exercise_sessions")
        .upsert(insert, { onConflict: "id" });

      if (error) throw error;

      console.log("[SyncService] ✅ Synced exercise session:", session.id);
      return { success: true };
    } catch (error) {
      console.error("[SyncService] ❌ Failed to sync exercise session:", error);
      this.queue.exerciseSessions.push(session);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Batch sync multiple exercise sessions
   * @param sessions Array of sessions to sync
   */
  async syncExerciseSessionsBatch(
    sessions: ExerciseSessionEntry[],
  ): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user || sessions.length === 0) {
      return { success: false, error: "No user or empty sessions" };
    }

    try {
      const inserts = sessions.map((s) => mapFromExerciseSession(s, user.id));

      const { error } = await supabase
        .from("exercise_sessions")
        .upsert(inserts, { onConflict: "id" });

      if (error) throw error;

      console.log(
        `[SyncService] ✅ Batch synced ${sessions.length} exercise sessions`,
      );
      return { success: true };
    } catch (error) {
      console.error("[SyncService] ❌ Batch sync failed:", error);
      sessions.forEach((s) => this.queue.exerciseSessions.push(s));
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================
  // Routine Sessions
  // ============================================================

  /**
   * Sync a completed routine session to Supabase
   * Called when: completeCurrentStep() finalizes session
   *
   * @param session Completed routine session
   * @returns Promise<SyncResult>
   */
  async syncRoutineSession(session: RoutineSession): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, queuing routine session");
      this.queue.routineSessions.push(session);
      return { success: false, error: "No authenticated user" };
    }

    try {
      const insert = mapFromRoutineSession(session, user.id);

      const { error } = await supabase
        .from("routine_sessions")
        .upsert(insert, { onConflict: "id" });

      if (error) throw error;

      console.log("[SyncService] ✅ Synced routine session:", session.id);
      return { success: true };
    } catch (error) {
      console.error("[SyncService] ❌ Failed to sync routine session:", error);
      this.queue.routineSessions.push(session);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================
  // Step Tracker Sessions
  // ============================================================

  /**
   * Sync a completed step tracker session to Supabase
   * Called when: finalizeActiveSession()
   *
   * @param session Completed step tracker session
   * @returns Promise<SyncResult>
   */
  async syncStepTrackerSession(
    session: StepTrackerSessionEntry,
  ): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, queuing step tracker session");
      this.queue.stepTrackerSessions.push(session);
      return { success: false, error: "No authenticated user" };
    }

    try {
      const insert = mapFromStepTrackerSession(session, user.id);

      const { error } = await supabase
        .from("step_tracker_sessions")
        .upsert(insert, { onConflict: "id" });

      if (error) throw error;

      console.log("[SyncService] ✅ Synced step tracker session:", session.id);
      return { success: true };
    } catch (error) {
      console.error(
        "[SyncService] ❌ Failed to sync step tracker session:",
        error,
      );
      this.queue.stepTrackerSessions.push(session);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  // ============================================================
  // Routine Analyses (AI Cache)
  // ============================================================

  /**
   * Sync AI analysis to Supabase (cache expensive results)
   * Called when: saveAnalysis()
   *
   * @param routineId Routine session ID
   * @param analysis AI analysis result
   * @returns Promise<SyncResult>
   */
  async syncRoutineAnalysis(
    routineId: string,
    analysis: RoutineAnalysisResponse,
  ): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, skipping analysis sync");
      return { success: false, error: "No authenticated user" };
    }

    try {
      const insert = mapFromRoutineAnalysis(routineId, analysis, user.id);

      const { error } = await supabase
        .from("routine_analyses")
        .upsert(insert, { onConflict: "routine_id,user_id" });

      if (error) throw error;

      console.log("[SyncService] ✅ Synced routine analysis:", routineId);
      return { success: true };
    } catch (error) {
      console.error("[SyncService] ❌ Failed to sync routine analysis:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Load routine analysis from Supabase
   * @param routineId Routine session ID
   * @returns Analysis or null if not found
   */
  async loadRoutineAnalysis(
    routineId: string,
  ): Promise<RoutineAnalysisResponse | null> {
    const user = useAuthStore.getState().user;
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from("routine_analyses")
        .select("*")
        .eq("routine_id", routineId)
        .eq("user_id", user.id)
        .single();

      if (error || !data) return null;

      return mapToRoutineAnalysis(data);
    } catch (error) {
      console.error("[SyncService] Failed to load routine analysis:", error);
      return null;
    }
  }

  // ============================================================
  // Full History Loading
  // ============================================================

  /**
   * Load full history from Supabase (on first launch / login)
   * Called when: app starts, user logs in
   *
   * @returns Complete history data
   */
  async loadFullHistory(): Promise<{
    exerciseSessions: ExerciseSessionEntry[];
    routineSessions: RoutineSession[];
    stepTrackerSessions: StepTrackerSessionEntry[];
  }> {
    const user = useAuthStore.getState().user;

    if (!user) {
      throw new Error("No authenticated user");
    }

    try {
      this.status = "syncing";

      const [exerciseRes, routineRes, stepTrackerRes] = await Promise.all([
        supabase
          .from("exercise_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(200), // Match HISTORY_LIMIT

        supabase
          .from("routine_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(12), // Match HISTORY_LIMIT

        supabase
          .from("step_tracker_sessions")
          .select("*")
          .eq("user_id", user.id)
          .order("started_at", { ascending: false })
          .limit(75), // Match HISTORY_LIMIT
      ]);

      if (exerciseRes.error) throw exerciseRes.error;
      if (routineRes.error) throw routineRes.error;
      if (stepTrackerRes.error) throw stepTrackerRes.error;

      this.status = "success";
      this.lastSyncAt = Date.now();

      const result = {
        exerciseSessions: exerciseRes.data.map(mapToExerciseSession),
        routineSessions: routineRes.data.map(mapToRoutineSession),
        stepTrackerSessions: stepTrackerRes.data.map(mapToStepTrackerSession),
      };

      console.log("[SyncService] ✅ Loaded full history:", {
        exerciseSessions: result.exerciseSessions.length,
        routineSessions: result.routineSessions.length,
        stepTrackerSessions: result.stepTrackerSessions.length,
      });

      return result;
    } catch (error) {
      this.status = "error";
      console.error("[SyncService] ❌ Failed to load full history:", error);
      throw error;
    }
  }

  // ============================================================
  // Queue Management
  // ============================================================

  /**
   * Flush pending queue (retry failed syncs)
   * Called when: network restored, app foreground
   */
  async flushQueue(): Promise<void> {
    const user = useAuthStore.getState().user;

    if (!user || this.status === "syncing") {
      console.log(
        "[SyncService] Cannot flush queue: no user or already syncing",
      );
      return;
    }

    const queueSize =
      this.queue.exerciseSessions.length +
      this.queue.routineSessions.length +
      this.queue.stepTrackerSessions.length;

    if (queueSize === 0) {
      console.log("[SyncService] Queue is empty, nothing to flush");
      return;
    }

    console.log("[SyncService] 🔄 Flushing queue:", {
      exerciseSessions: this.queue.exerciseSessions.length,
      routineSessions: this.queue.routineSessions.length,
      stepTrackerSessions: this.queue.stepTrackerSessions.length,
    });

    const promises: Promise<SyncResult>[] = [];

    // Batch sync exercise sessions
    if (this.queue.exerciseSessions.length > 0) {
      const sessions = [...this.queue.exerciseSessions];
      this.queue.exerciseSessions = [];
      promises.push(this.syncExerciseSessionsBatch(sessions));
    }

    // Individual syncs for routines
    this.queue.routineSessions.forEach((session) => {
      promises.push(this.syncRoutineSession(session));
    });
    this.queue.routineSessions = [];

    // Individual syncs for step tracker
    this.queue.stepTrackerSessions.forEach((session) => {
      promises.push(this.syncStepTrackerSession(session));
    });
    this.queue.stepTrackerSessions = [];

    try {
      const results = await Promise.allSettled(promises);
      const successCount = results.filter(
        (r) => r.status === "fulfilled" && r.value.success,
      ).length;

      console.log(
        `[SyncService] ✅ Queue flush complete: ${successCount}/${results.length} succeeded`,
      );
    } catch (error) {
      console.error("[SyncService] ❌ Queue flush failed:", error);
    }
  }

  /**
   * Clear all pending items in queue
   */
  clearQueue(): void {
    this.queue = {
      exerciseSessions: [],
      routineSessions: [],
      stepTrackerSessions: [],
    };
    console.log("[SyncService] Queue cleared");
  }

  /**
   * Get current sync status
   */
  getStatus(): {
    status: SyncStatus;
    lastSyncAt: number | null;
    queueSize: number;
  } {
    return {
      status: this.status,
      lastSyncAt: this.lastSyncAt,
      queueSize:
        this.queue.exerciseSessions.length +
        this.queue.routineSessions.length +
        this.queue.stepTrackerSessions.length,
    };
  }

  // ============================================================
  // Delete Operations (for Settings cleanup)
  // ============================================================

  /**
   * Delete all exercise sessions from Supabase
   * Called when: User clears exercise history in Settings
   *
   * @returns Promise<SyncResult>
   */
  async deleteAllExerciseSessions(): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, skipping delete");
      return { success: false, error: "No authenticated user" };
    }

    try {
      const { error } = await supabase
        .from("exercise_sessions")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      console.log("[SyncService] ✅ Deleted all exercise sessions from cloud");
      return { success: true };
    } catch (error) {
      console.error(
        "[SyncService] ❌ Failed to delete exercise sessions:",
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete all routine sessions from Supabase
   * Called when: User clears routine history in Settings
   *
   * @returns Promise<SyncResult>
   */
  async deleteAllRoutineSessions(): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, skipping delete");
      return { success: false, error: "No authenticated user" };
    }

    try {
      // Delete routine analyses first (foreign key constraint)
      await supabase.from("routine_analyses").delete().eq("user_id", user.id);

      // Delete routine sessions
      const { error } = await supabase
        .from("routine_sessions")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      console.log(
        "[SyncService] ✅ Deleted all routine sessions and analyses from cloud",
      );
      return { success: true };
    } catch (error) {
      console.error(
        "[SyncService] ❌ Failed to delete routine sessions:",
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete all step tracker sessions from Supabase
   * Called when: User clears step tracker history in Settings
   *
   * @returns Promise<SyncResult>
   */
  async deleteAllStepTrackerSessions(): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, skipping delete");
      return { success: false, error: "No authenticated user" };
    }

    try {
      const { error } = await supabase
        .from("step_tracker_sessions")
        .delete()
        .eq("user_id", user.id);

      if (error) throw error;

      console.log(
        "[SyncService] ✅ Deleted all step tracker sessions from cloud",
      );
      return { success: true };
    } catch (error) {
      console.error(
        "[SyncService] ❌ Failed to delete step tracker sessions:",
        error,
      );
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete ALL user data from Supabase
   * Called when: User deletes account in Settings
   *
   * @returns Promise<SyncResult>
   */
  async deleteAllUserData(): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, skipping delete");
      return { success: false, error: "No authenticated user" };
    }

    try {
      // Delete routine_analyses first (has foreign key to routine_sessions)
      await supabase.from("routine_analyses").delete().eq("user_id", user.id);

      // Delete other tables in parallel (no dependencies between them)
      await Promise.all([
        supabase.from("exercise_sessions").delete().eq("user_id", user.id),
        supabase.from("routine_sessions").delete().eq("user_id", user.id),
        supabase.from("step_tracker_sessions").delete().eq("user_id", user.id),
      ]);

      console.log("[SyncService] ✅ Deleted ALL user data from cloud");
      return { success: true };
    } catch (error) {
      console.error("[SyncService] ❌ Failed to delete user data:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Delete user account from Supabase Auth
   * Called when: User permanently deletes account in Settings
   * NOTE: This will cascade delete all user data via RLS policies
   *
   * @returns Promise<SyncResult>
   */
  async deleteUserAccount(): Promise<SyncResult> {
    const user = useAuthStore.getState().user;

    if (!user) {
      console.log("[SyncService] No user, skipping account deletion");
      return { success: false, error: "No authenticated user" };
    }

    try {
      // First delete all user data from tables
      const dataResult = await this.deleteAllUserData();
      if (!dataResult.success) {
        throw new Error(dataResult.error || "Failed to delete user data");
      }

      // Then delete the user from Supabase Auth
      const { error } = await supabase.rpc("delete_user");

      if (error) {
        // If RPC fails, try direct auth deletion (requires admin privileges)
        const { error: authError } = await supabase.auth.admin.deleteUser(
          user.id,
        );
        if (authError) throw authError;
      }

      console.log("[SyncService] ✅ Deleted user account from Supabase");
      return { success: true };
    } catch (error) {
      console.error("[SyncService] ❌ Failed to delete user account:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}

// Singleton instance
export const syncService = new SyncService();
