import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { XStack, YStack, useTheme } from "tamagui";

import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useAuthStore } from "@/stores/authStore";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { usePreferencesStore, type ThemeMode } from "@/stores/preferencesStore";
import { useRoutineBuilderStore } from "@/stores/routineBuilderStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { showAlert } from "@/utils/alert";
import { exportAppData, importAppData } from "@/utils/dataExport";
import {
  ACTION_GAP,
  ACTION_ICON_SIZE,
  CARD_GAP,
  OPTION_ICON_SIZE,
  SECTION_GAP,
} from "./settings.styles";
import { SettingsAction } from "./settings.types";

type LanguageCode = ReturnType<
  typeof useAppLanguage
>["supportedLanguages"][number];

interface ChoiceButtonProps {
  label: string;
  selected: boolean;
  onPress: () => void;
  accessibilityLabel: string;
}

const ChoiceButton: React.FC<ChoiceButtonProps> = ({
  label,
  selected,
  onPress,
  accessibilityLabel,
}) => (
  <TButton
    size="$4"
    variant={selected ? "primary" : "outline"}
    iconName={selected ? "checkmark-circle" : undefined}
    onPress={onPress}
    accessibilityRole="button"
    accessibilityLabel={accessibilityLabel}
    accessibilityState={{ selected }}
  >
    {label}
  </TButton>
);

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

/**
 * Settings screen for WorkoutPilot
 * Modernized with Tamagui components for a consistent, professional layout.
 */
const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const { language, changeLanguage, supportedLanguages } = useAppLanguage();
  const resetHistory = useExerciseSessionStore((state) => state.resetHistory);
  const resetRoutineHistory = useRoutineSessionStore(
    (state) => state.resetHistory,
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

  const accentColor = resolveTokenColor(
    theme as Record<string, unknown>,
    "$info",
  );
  const dangerColor = resolveTokenColor(
    theme as Record<string, unknown>,
    "$error",
  );

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
          onPress: () => {
            resetHistory();
            showAlert(
              t("settings.data.clearedTitle"),
              t("settings.data.clearedMessage"),
            );
          },
        },
      ],
    );
  }, [resetHistory, t]);

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
          onPress: () => {
            resetRoutineHistory();
            showAlert(
              t("settings.data.clearedRoutineTitle"),
              t("settings.data.clearedRoutineMessage"),
            );
          },
        },
      ],
    );
  }, [resetRoutineHistory, t]);

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
          onPress: () => {
            resetAuth();
            resetHistory();
            resetRoutineHistory();
            resetRoutine();

            showAlert(
              t("settings.data.accountDeletedTitle"),
              t("settings.data.accountDeletedMessage"),
            );

            router.replace("/login");
          },
        },
      ],
    );
  }, [resetAuth, resetHistory, resetRoutine, resetRoutineHistory, router, t]);

  const handleExportData = useCallback(async () => {
    try {
      await exportAppData();
      showAlert(t("settings.data.exportSuccess"));
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "File selection cancelled"
      ) {
        // User cancelled, don't show error
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
      handleDeleteAccount,
      handleExportData,
      handleImportData,
      t,
    ],
  );

  return (
    <TPage backgroundColor="$background" hasHeader>
      <ScreenHeader
        title={t("settings.title")}
        subtitle={t("settings.subtitle")}
      />

      <TStack gap={SECTION_GAP} paddingBottom="$5">
        <TCard gap={CARD_GAP}>
          <TRow gap="$3" alignItems="center">
            <Ionicons
              name="color-palette-outline"
              size={ACTION_ICON_SIZE}
              color={accentColor}
              accessibilityElementsHidden
            />
            <THeading level={3}>{t("settings.appearance.title")}</THeading>
          </TRow>

          <TText variant="caption" color="$placeholderColor">
            {t("settings.appearance.themeDescription")}
          </TText>

          <TRow gap="$3" flexWrap="wrap">
            {themeOptions.map(({ mode, label, accessibility }) => (
              <ChoiceButton
                key={mode}
                label={label}
                selected={(themeMode ?? "light") === mode}
                onPress={() => setThemeMode(mode)}
                accessibilityLabel={`${label}. ${accessibility}`}
              />
            ))}
          </TRow>
        </TCard>

        <TCard gap={CARD_GAP}>
          <TRow gap="$3" alignItems="center">
            <Ionicons
              name="language-outline"
              size={ACTION_ICON_SIZE}
              color={accentColor}
              accessibilityElementsHidden
            />
            <THeading level={3}>{t("settings.language.title")}</THeading>
          </TRow>

          <TText variant="caption" color="$placeholderColor">
            {t("settings.language.description")}
          </TText>

          <TRow gap="$3" flexWrap="wrap">
            {languageOptions.map(({ code, label }) => (
              <ChoiceButton
                key={code}
                label={label}
                selected={language === code}
                onPress={() => changeLanguage(code)}
                accessibilityLabel={label}
              />
            ))}
          </TRow>
        </TCard>

        <TCard gap={CARD_GAP} borderColor="$borderColor">
          <TRow gap="$3" alignItems="center">
            <Ionicons
              name="shield-checkmark-outline"
              size={ACTION_ICON_SIZE}
              color={accentColor}
              accessibilityElementsHidden
            />
            <THeading level={3}>{t("settings.data.title")}</THeading>
          </TRow>

          <YStack gap={ACTION_GAP} width="100%">
            {dataActions.map((action) => (
              <TCard
                key={action.key}
                gap="$3"
                padding="$3"
                borderColor={
                  action.tone === "danger"
                    ? "$error"
                    : action.tone === "primary"
                      ? "$info"
                      : "$borderColor"
                }
                backgroundColor="$background"
              >
                <XStack gap="$3" alignItems="flex-start">
                  <Ionicons
                    name={action.iconName}
                    size={OPTION_ICON_SIZE}
                    color={
                      action.tone === "danger"
                        ? dangerColor
                        : action.tone === "primary"
                          ? accentColor
                          : accentColor
                    }
                    accessibilityElementsHidden
                  />

                  <TStack gap="$2" flex={1} minWidth={0}>
                    <THeading level={4}>{action.title}</THeading>
                    <TText variant="caption" color="$placeholderColor">
                      {action.description}
                    </TText>

                    <TRow>
                      <TButton
                        size="$4"
                        variant={
                          action.tone === "danger"
                            ? "outline"
                            : action.tone === "primary"
                              ? "primary"
                              : "secondary"
                        }
                        textColor={
                          action.tone === "danger" ? "$error" : undefined
                        }
                        iconName={action.iconName}
                        onPress={action.onPress}
                        accessibilityLabel={action.title}
                      >
                        {action.title}
                      </TButton>
                    </TRow>
                  </TStack>
                </XStack>
              </TCard>
            ))}
          </YStack>
        </TCard>
      </TStack>
    </TPage>
  );
};

export default SettingsScreen;
