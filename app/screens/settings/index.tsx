import React from "react";
import { useTranslation } from "react-i18next";
import { Alert, Pressable, ScrollView, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themedText";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useExerciseSessionStore } from "@/stores/exerciseSessionStore";
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
            {code.toUpperCase()}
          </ThemedText>
        </Pressable>
      );
    })}
  </View>
);

/**
 * Settings screen for WorkoutPilot
 * Allows users to configure app preferences
 */
const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { language, changeLanguage, supportedLanguages } = useAppLanguage();
  const resetHistory = useExerciseSessionStore((state) => state.resetHistory);

  const languageLabels = {
    en: t("settings.language.english"),
    es: t("settings.language.spanish"),
  } as const;

  const languageOptions = supportedLanguages.map((code) => ({
    code,
    label: languageLabels[code],
  }));

  const handleClearHistory = () => {
    Alert.alert(
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
            Alert.alert(
              t("settings.data.clearedTitle"),
              t("settings.data.clearedMessage"),
            );
          },
        },
      ],
    );
  };

  return (
    <ScrollView style={[styles.page, { paddingTop: 16 + insets.top }]}>
      <View style={styles.headerContainer}>
        <ThemedText type="title">{t("settings.title")}</ThemedText>
        <ThemedText>{t("settings.subtitle")}</ThemedText>
      </View>

      <View style={styles.section}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          {t("settings.language.title")}
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
      </View>
    </ScrollView>
  );
};

export default SettingsScreen;
