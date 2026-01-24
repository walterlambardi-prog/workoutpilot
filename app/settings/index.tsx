import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable, ScrollView, View } from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/authStore";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
import { usePreferencesStore, type ThemeMode } from "@/stores/preferencesStore";
import { useRoutineSessionStore } from "@/stores/routineSessionStore";
import { showAlert } from "@/utils/alert";
import { useRouter } from "expo-router";
import styles from "./settings.styles";

type LanguageCode = ReturnType<
  typeof useAppLanguage
>["supportedLanguages"][number];

interface LanguageSwitcherProps {
  value: LanguageCode;
  options: { code: LanguageCode; label: string }[];
  onChange: (code: LanguageCode) => void;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  value,
  options,
  onChange,
}) => (
  <View style={styles.languageToggle}>
    {options.map(({ code, label }) => {
      const selected = value === code;
      return (
        <Pressable
          key={code}
          onPress={() => onChange(code)}
          style={({ pressed }) => [
            styles.languagePill,
            selected ? styles.languagePillActive : null,
            pressed ? styles.languagePillPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={label}
          accessibilityState={{ selected }}
        >
          <ThemedText
            style={[
              styles.languagePillText,
              selected ? styles.languagePillTextActive : null,
            ]}
          >
            {label}
          </ThemedText>
        </Pressable>
      );
    })}
  </View>
);

interface ThemeSwitcherProps {
  value: ThemeMode;
  onChange: (mode: ThemeMode) => void;
}

const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ value, onChange }) => {
  const modes: { mode: ThemeMode; label: string }[] = [
    { mode: "light", label: "LIGHT" },
    { mode: "dark", label: "DARK" },
  ];

  return (
    <View style={styles.languageToggle}>
      {modes.map(({ mode, label }) => {
        const selected = value === mode;
        return (
          <Pressable
            key={mode}
            onPress={() => onChange(mode)}
            style={({ pressed }) => [
              styles.languagePill,
              selected ? styles.languagePillActive : null,
              pressed ? styles.languagePillPressed : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={label}
            accessibilityState={{ selected }}
          >
            <ThemedText
              style={[
                styles.languagePillText,
                selected ? styles.languagePillTextActive : null,
              ]}
            >
              {label}
            </ThemedText>
          </Pressable>
        );
      })}
    </View>
  );
};

/**
 * Settings screen for WorkoutPilot
 * Allows users to configure app preferences
 */
const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { language, changeLanguage, supportedLanguages } = useAppLanguage();
  const resetHistory = useExerciseSessionStore((state) => state.resetHistory);
  const resetRoutineHistory = useRoutineSessionStore(
    (state) => state.resetHistory,
  );
  const resetAuth = useAuthStore(
    (state: { resetAuth: () => void }) => state.resetAuth,
  );
  const backgroundColor = useThemeColor({}, "background");
  const themeMode = usePreferencesStore(
    (state: { themeMode: ThemeMode | null }) => state.themeMode,
  );
  const setThemeMode = usePreferencesStore(
    (state: { setThemeMode: (mode: ThemeMode) => void }) => state.setThemeMode,
  );

  const languageLabels = {
    en: t("settings.language.english"),
    es: t("settings.language.spanish"),
  } as const;

  const languageOptions = supportedLanguages.map((code) => ({
    code,
    label: languageLabels[code],
  }));

  const handleClearHistory = () => {
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
  };

  const handleClearRoutineHistory = () => {
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
  };

  const handleDeleteAccount = () => {
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
            // Reset all stores
            resetAuth();
            resetHistory();
            resetRoutineHistory();

            showAlert(
              t("settings.data.accountDeletedTitle"),
              t("settings.data.accountDeletedMessage"),
            );

            // Navigate to login screen
            router.replace("/login");
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={[styles.page, { backgroundColor }]}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.headerContainer}>
        <ThemedText style={styles.title} type="title">
          {t("settings.title")}
        </ThemedText>
        <ThemedText style={styles.subtitle}>
          {t("settings.subtitle")}
        </ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t("settings.appearance.title")}
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>
          {t("settings.appearance.themeDescription")}
        </ThemedText>
        <ThemeSwitcher value={themeMode ?? "light"} onChange={setThemeMode} />
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t("settings.language.title")}
        </ThemedText>
        <ThemedText style={styles.sectionDescription}>
          {t("settings.language.description")}
        </ThemedText>
        <LanguageSwitcher
          value={language}
          options={languageOptions}
          onChange={changeLanguage}
        />
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t("settings.data.title")}
        </ThemedText>
        <Pressable
          onPress={handleClearHistory}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonDestructive,
            pressed ? styles.actionButtonPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("settings.data.clearHistory")}
        >
          <ThemedText
            style={[
              styles.actionButtonText,
              styles.actionButtonTextDestructive,
            ]}
          >
            {t("settings.data.clearHistory")}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleClearRoutineHistory}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonDestructive,
            pressed ? styles.actionButtonPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("settings.data.clearRoutineHistory")}
        >
          <ThemedText
            style={[
              styles.actionButtonText,
              styles.actionButtonTextDestructive,
            ]}
          >
            {t("settings.data.clearRoutineHistory")}
          </ThemedText>
        </Pressable>
        <Pressable
          onPress={handleDeleteAccount}
          style={({ pressed }) => [
            styles.actionButton,
            styles.actionButtonDestructive,
            pressed ? styles.actionButtonPressed : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("settings.data.deleteAccount")}
        >
          <ThemedText
            style={[
              styles.actionButtonText,
              styles.actionButtonTextDestructive,
            ]}
          >
            {t("settings.data.deleteAccount")}
          </ThemedText>
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
