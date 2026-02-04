import { useRouter } from "expo-router";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "tamagui";

import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useAuthStore } from "@/stores/authStore";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { usePreferencesStore, type ThemeMode } from "@/stores/preferencesStore";
import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { useStepTrackerStore } from "@/stores/stepTrackerStore";
import { showAlert } from "@/utils/alert";
import { exportAppData, importAppData } from "@/utils/dataExport";

import { SettingsAction } from "../settings.types";

type LanguageCode = ReturnType<
  typeof useAppLanguage
>["supportedLanguages"][number];

const resolveTokenColor = (
  theme: Record<string, unknown>,
  token: string,
): string => {
  const key = token.replace("$", "");
  const value = theme[key];
  if (value && typeof value === "object" && "val" in (value as object)) {
    return (value as { val?: string }).val ?? token;
  }
  if (typeof value === "string") {
    return value;
  }
  return token;
};

export const useSettings = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { language, changeLanguage, supportedLanguages } = useAppLanguage();

  // Store actions
  const resetHistory = useExerciseSessionStore((state) => state.resetHistory);
  const deleteExerciseCloudHistory = useExerciseSessionStore(
    (state) => state.deleteCloudHistory,
  );
  const resetRoutineHistory = useRoutineSessionStore(
    (state) => state.resetHistory,
  );
  const deleteRoutineCloudHistory = useRoutineSessionStore(
    (state) => state.deleteCloudHistory,
  );
  const resetStepTrackerHistory = useStepTrackerStore(
    (state) => state.resetHistory,
  );
  const deleteStepTrackerCloudHistory = useStepTrackerStore(
    (state) => state.deleteCloudHistory,
  );
  const resetRoutine = useRoutineBuilderStore((state) => state.resetRoutine);
  const resetAuth = useAuthStore(
    (state: { resetAuth: () => void }) => state.resetAuth,
  );
  const themeMode = usePreferencesStore(
    (state: { themeMode: ThemeMode | null }) => state.themeMode,
  );
  const setThemeMode = usePreferencesStore(
    (state: { setThemeMode: (mode: ThemeMode) => void }) => state.setThemeMode,
  );

  // Theme colors
  const accentColor = resolveTokenColor(
    theme as Record<string, unknown>,
    "$info",
  );
  const dangerColor = resolveTokenColor(
    theme as Record<string, unknown>,
    "$error",
  );

  // Language options
  const languageLabels = useMemo(
    () => ({
      en: t("settings.language.english"),
      es: t("settings.language.spanish"),
    }),
    [t],
  ) as Record<LanguageCode, string>;

  const languageOptions = useMemo(
    () =>
      supportedLanguages.map((code) => ({
        code,
        label: languageLabels[code],
      })),
    [languageLabels, supportedLanguages],
  );

  // Theme options
  const themeOptions = useMemo(
    () => [
      {
        mode: "light" as ThemeMode,
        label: t("settings.appearance.lightMode"),
        accessibility: t("settings.appearance.themeDescription"),
      },
      {
        mode: "dark" as ThemeMode,
        label: t("settings.appearance.darkMode"),
        accessibility: t("settings.appearance.themeDescription"),
      },
    ],
    [t],
  );

  // Event handlers
  const handleClearHistory = useCallback(() => {
    showAlert(
      t("settings.data.clearHistoryConfirmTitle"),
      t("settings.data.clearHistoryConfirmMessage"),
      [
        {
          text: t("settings.data.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.data.clearHistoryConfirm"),
          style: "destructive",
          onPress: async () => {
            // Clear local data
            resetHistory();

            // Clear cloud data (non-blocking)
            deleteExerciseCloudHistory().catch((error) => {
              console.error(
                "[Settings] Failed to delete exercise sessions from cloud:",
                error,
              );
            });

            showAlert(
              t("settings.data.clearedTitle"),
              t("settings.data.clearedMessage"),
            );
          },
        },
      ],
    );
  }, [deleteExerciseCloudHistory, resetHistory, t]);

  const handleClearRoutineHistory = useCallback(() => {
    showAlert(
      t("settings.data.clearRoutineHistoryConfirmTitle"),
      t("settings.data.clearRoutineHistoryConfirmMessage"),
      [
        {
          text: t("settings.data.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.data.clearRoutineHistoryConfirm"),
          style: "destructive",
          onPress: async () => {
            // Clear local data
            resetRoutineHistory();

            // Clear cloud data (non-blocking)
            deleteRoutineCloudHistory().catch((error) => {
              console.error(
                "[Settings] Failed to delete routine sessions from cloud:",
                error,
              );
            });

            showAlert(
              t("settings.data.clearedRoutineTitle"),
              t("settings.data.clearedRoutineMessage"),
            );
          },
        },
      ],
    );
  }, [deleteRoutineCloudHistory, resetRoutineHistory, t]);

  const handleClearStepTrackerHistory = useCallback(() => {
    showAlert(
      t("settings.data.clearStepTrackerHistoryConfirmTitle"),
      t("settings.data.clearStepTrackerHistoryConfirmMessage"),
      [
        {
          text: t("settings.data.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.data.clearStepTrackerHistoryConfirm"),
          style: "destructive",
          onPress: async () => {
            // Clear local data
            resetStepTrackerHistory();

            // Clear cloud data (non-blocking)
            deleteStepTrackerCloudHistory().catch((error) => {
              console.error(
                "[Settings] Failed to delete step tracker sessions from cloud:",
                error,
              );
            });

            showAlert(
              t("settings.data.clearedStepTrackerTitle"),
              t("settings.data.clearedStepTrackerMessage"),
            );
          },
        },
      ],
    );
  }, [deleteStepTrackerCloudHistory, resetStepTrackerHistory, t]);

  const handleDeleteAccount = useCallback(() => {
    showAlert(
      t("settings.data.deleteAccountConfirmTitle"),
      t("settings.data.deleteAccountConfirmMessage"),
      [
        {
          text: t("settings.data.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.data.deleteAccountConfirm"),
          style: "destructive",
          onPress: async () => {
            // Clear local data
            resetAuth();
            resetHistory();
            resetRoutineHistory();
            resetStepTrackerHistory();
            resetRoutine();

            // Clear all cloud data (sequential to respect foreign keys)
            try {
              // Delete routine cloud history first (includes routine_analyses)
              await deleteRoutineCloudHistory();

              // Delete other histories in parallel (no dependencies)
              await Promise.all([
                deleteExerciseCloudHistory(),
                deleteStepTrackerCloudHistory(),
              ]);
            } catch (error) {
              console.error(
                "[Settings] Failed to delete user data from cloud:",
                error,
              );
            }

            showAlert(
              t("settings.data.accountDeletedTitle"),
              t("settings.data.accountDeletedMessage"),
            );

            router.replace("/login");
          },
        },
      ],
    );
  }, [
    deleteExerciseCloudHistory,
    deleteRoutineCloudHistory,
    deleteStepTrackerCloudHistory,
    resetAuth,
    resetHistory,
    resetRoutine,
    resetRoutineHistory,
    resetStepTrackerHistory,
    router,
    t,
  ]);

  const handleExportData = useCallback(async () => {
    try {
      await exportAppData();
      showAlert(t("settings.data.exportSuccess"));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "File selection cancelled"
      ) {
        return;
      }
      console.error("Export error:", error);
      showAlert(
        t("settings.data.exportError"),
        error instanceof Error ? error.message : "Unknown error",
      );
    }
  }, [t]);

  const handleImportData = useCallback(() => {
    showAlert(
      t("settings.data.importConfirmTitle"),
      t("settings.data.importConfirmMessage"),
      [
        {
          text: t("settings.data.cancel"),
          style: "cancel",
        },
        {
          text: t("settings.data.importConfirm"),
          style: "default",
          onPress: async () => {
            try {
              await importAppData();
              showAlert(t("settings.data.importSuccess"));
            } catch (error) {
              if (
                error instanceof Error &&
                error.message === "File selection cancelled"
              ) {
                showAlert(t("settings.data.importCancelled"));
                return;
              }
              console.error("Import error:", error);
              showAlert(
                t("settings.data.importError"),
                error instanceof Error ? error.message : "Unknown error",
              );
            }
          },
        },
      ],
    );
  }, [t]);

  // Data actions
  const dataActions = useMemo<SettingsAction[]>(
    () => [
      {
        key: "export-data",
        title: t("settings.data.exportData"),
        description: t("settings.data.exportDataDescription"),
        iconName: "download-outline",
        tone: "primary",
        onPress: handleExportData,
      },
      {
        key: "import-data",
        title: t("settings.data.importData"),
        description: t("settings.data.importDataDescription"),
        iconName: "cloud-upload-outline",
        tone: "primary",
        onPress: handleImportData,
      },
      {
        key: "clear-history",
        title: t("settings.data.clearHistory"),
        description: t("settings.data.clearHistoryConfirmMessage"),
        iconName: "trash-outline",
        tone: "danger",
        onPress: handleClearHistory,
      },
      {
        key: "clear-steptracker-history",
        title: t("settings.data.clearStepTrackerHistory"),
        description: t("settings.data.clearStepTrackerHistoryConfirmMessage"),
        iconName: "walk-outline",
        tone: "danger",
        onPress: handleClearStepTrackerHistory,
      },
      {
        key: "clear-routine-history",
        title: t("settings.data.clearRoutineHistory"),
        description: t("settings.data.clearRoutineHistoryConfirmMessage"),
        iconName: "repeat-outline",
        tone: "danger",
        onPress: handleClearRoutineHistory,
      },
      {
        key: "delete-account",
        title: t("settings.data.deleteAccount"),
        description: t("settings.data.deleteAccountConfirmMessage"),
        iconName: "warning-outline",
        tone: "danger",
        onPress: handleDeleteAccount,
      },
    ],
    [
      handleClearHistory,
      handleClearRoutineHistory,
      handleClearStepTrackerHistory,
      handleDeleteAccount,
      handleExportData,
      handleImportData,
      t,
    ],
  );

  return {
    // State
    language,
    themeMode,

    // Theme
    accentColor,
    dangerColor,

    // Options
    languageOptions,
    themeOptions,
    dataActions,

    // Actions
    changeLanguage,
    setThemeMode,
  };
};
