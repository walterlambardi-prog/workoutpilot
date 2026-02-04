import { Platform } from "react-native";

import { useAuthStore } from "@/stores/authStore";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { usePreferencesStore } from "@/stores/preferencesStore";
import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import {
  type StepTrackerSessionEntry,
  useStepTrackerStore,
} from "@/stores/stepTrackerStore";

/**
 * Interface representing all exportable app data (excluding username)
 */
export interface AppExportData {
  version: string;
  exportedAt: number;
  auth: {
    hasCompletedOnboarding: boolean;
  };
  preferences: {
    language: string | null;
    themeMode: string | null;
  };
  exerciseSessions: {
    currentSession: unknown;
    history: unknown[];
  };
  routineBuilder: {
    rounds: number;
    exercises: unknown;
  };
  routineSessions: {
    activeSession: unknown;
    lastCompletedSession: unknown;
    history: unknown[];
    analysisCache: unknown;
  };
  stepTrackerSessions?: {
    history: StepTrackerSessionEntry[];
  };
}

/**
 * Collects all app data from stores (excluding username)
 */
const collectAppData = (): AppExportData => {
  const authState = useAuthStore.getState();
  const preferencesState = usePreferencesStore.getState();
  const exerciseSessionState = useExerciseSessionStore.getState();
  const routineBuilderState = useRoutineBuilderStore.getState();
  const routineSessionState = useRoutineSessionStore.getState();
  const stepTrackerSessionState = useStepTrackerStore.getState();

  return {
    version: "1.0",
    exportedAt: Date.now(),
    auth: {
      hasCompletedOnboarding: authState.hasCompletedOnboarding,
      // Explicitly exclude username
    },
    preferences: {
      language: preferencesState.language,
      themeMode: preferencesState.themeMode,
    },
    exerciseSessions: {
      currentSession: exerciseSessionState.currentSession,
      history: exerciseSessionState.history,
    },
    routineBuilder: {
      rounds: routineBuilderState.rounds,
      exercises: routineBuilderState.exercises,
    },
    routineSessions: {
      activeSession: routineSessionState.activeSession,
      lastCompletedSession: routineSessionState.lastCompletedSession,
      history: routineSessionState.history,
      analysisCache: routineSessionState.analysisCache,
    },
    stepTrackerSessions: {
      history: stepTrackerSessionState.history,
    },
  };
};

/**
 * Export data on Web platform using blob download
 */
const exportDataWeb = async (): Promise<void> => {
  const data = collectAppData();
  const json = JSON.stringify(data, null, 2);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `workoutpilot-data-${timestamp}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Export data on Native platform using expo-sharing
 */
const exportDataNative = async (): Promise<void> => {
  // Dynamic imports to avoid breaking web build
  const [FileSystemModule, SharingModule] = await Promise.all([
    import("expo-file-system/legacy"),
    import("expo-sharing"),
  ]);

  const data = collectAppData();
  const json = JSON.stringify(data, null, 2);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `workoutpilot-data-${timestamp}.json`;
  const fileUri = `${FileSystemModule.documentDirectory}${filename}`;

  await FileSystemModule.writeAsStringAsync(fileUri, json, {
    encoding: FileSystemModule.EncodingType.UTF8,
  });

  if (await SharingModule.isAvailableAsync()) {
    await SharingModule.shareAsync(fileUri, {
      mimeType: "application/json",
      dialogTitle: "Export WorkoutPilot Data",
      UTI: "public.json",
    });
  } else {
    throw new Error("Sharing is not available on this device");
  }
};

/**
 * Cross-platform export function
 * Downloads a JSON file with all app data (excluding username)
 */
export const exportAppData = async (): Promise<void> => {
  if (Platform.OS === "web") {
    return exportDataWeb();
  }
  return exportDataNative();
};

/**
 * Import data on Web platform using file input
 */
const importDataWeb = async (): Promise<AppExportData> => {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json,.json";

    input.onchange = async (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      if (!file) {
        reject(new Error("No file selected"));
        return;
      }

      try {
        const text = await file.text();
        const data = JSON.parse(text) as AppExportData;
        resolve(data);
      } catch (error) {
        reject(error);
      }
    };

    input.oncancel = () => {
      reject(new Error("File selection cancelled"));
    };

    input.click();
  });
};

/**
 * Import data on Native platform using expo-document-picker
 */
const importDataNative = async (): Promise<AppExportData> => {
  // Dynamic imports to avoid breaking web build
  const [DocumentPickerModule, FileSystemModule] = await Promise.all([
    import("expo-document-picker"),
    import("expo-file-system/legacy"),
  ]);

  const result = await DocumentPickerModule.getDocumentAsync({
    type: "application/json",
    copyToCacheDirectory: true,
  });

  if (result.canceled) {
    throw new Error("File selection cancelled");
  }

  const fileUri = result.assets[0].uri;
  const content = await FileSystemModule.readAsStringAsync(fileUri, {
    encoding: FileSystemModule.EncodingType.UTF8,
  });

  return JSON.parse(content) as AppExportData;
};

/**
 * Validates imported data structure
 */
const validateImportData = (data: unknown): data is AppExportData => {
  if (!data || typeof data !== "object") return false;

  const d = data as Partial<AppExportData>;

  const stepTrackerValid =
    d.stepTrackerSessions === undefined ||
    (d.stepTrackerSessions !== undefined &&
      typeof d.stepTrackerSessions === "object" &&
      Array.isArray((d.stepTrackerSessions as { history?: unknown }).history));

  return (
    typeof d.version === "string" &&
    typeof d.exportedAt === "number" &&
    d.auth !== undefined &&
    d.preferences !== undefined &&
    d.exerciseSessions !== undefined &&
    d.routineBuilder !== undefined &&
    d.routineSessions !== undefined &&
    stepTrackerValid
  );
};

/**
 * Applies imported data to stores (excluding username)
 */
const applyImportData = (data: AppExportData): void => {
  const authState = useAuthStore.getState();
  const preferencesState = usePreferencesStore.getState();

  // Auth (excluding username)
  authState.setHasCompletedOnboarding(data.auth.hasCompletedOnboarding);

  // Preferences
  if (data.preferences.language) {
    preferencesState.setLanguage(
      data.preferences.language as Parameters<
        typeof preferencesState.setLanguage
      >[0],
    );
  }
  if (data.preferences.themeMode) {
    preferencesState.setThemeMode(
      data.preferences.themeMode as Parameters<
        typeof preferencesState.setThemeMode
      >[0],
    );
  }

  // Exercise sessions - use internal state setter directly
  useExerciseSessionStore.setState({
    currentSession: data.exerciseSessions.currentSession,
    history: data.exerciseSessions.history,
  } as Partial<ReturnType<typeof useExerciseSessionStore.getState>>);

  // Routine builder
  useRoutineBuilderStore.setState({
    rounds: data.routineBuilder.rounds,
    exercises: data.routineBuilder.exercises,
  } as Partial<ReturnType<typeof useRoutineBuilderStore.getState>>);

  // Routine sessions
  useRoutineSessionStore.setState({
    activeSession: data.routineSessions.activeSession,
    lastCompletedSession: data.routineSessions.lastCompletedSession,
    history: data.routineSessions.history,
    analysisCache: data.routineSessions.analysisCache,
  } as Partial<ReturnType<typeof useRoutineSessionStore.getState>>);

  // Step tracker sessions (optional for backward compatibility)
  useStepTrackerStore.setState({
    history: data.stepTrackerSessions?.history ?? [],
  } as Partial<ReturnType<typeof useStepTrackerStore.getState>>);
};

/**
 * Cross-platform import function
 * Reads a JSON file and restores app data (excluding username)
 * @throws Error if file selection is cancelled or data is invalid
 */
export const importAppData = async (): Promise<void> => {
  let data: AppExportData;

  if (Platform.OS === "web") {
    data = await importDataWeb();
  } else {
    data = await importDataNative();
  }

  if (!validateImportData(data)) {
    throw new Error("Invalid data format");
  }

  applyImportData(data);
};
