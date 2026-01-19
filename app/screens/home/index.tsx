import { Link } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Pressable } from "react-native";

import { HelloWave } from "@/components/helloWave";
import { ThemedText } from "@/components/themedText";
import { ThemedView } from "@/components/themedView";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import styles from "./home.styles";
import type { HomeNavAction } from "./home.types";

type LanguageCode = ReturnType<
  typeof useAppLanguage
>["supportedLanguages"][number];

interface LanguageSwitcherProps {
  value: LanguageCode;
  options: { code: LanguageCode; label: string }[];
  onChange: (code: LanguageCode) => void;
  hint: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  value,
  options,
  onChange,
  hint,
}) => (
  <ThemedView style={styles.languageToggle}>
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
          accessibilityHint={hint}
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
  </ThemedView>
);

const actions: HomeNavAction[] = [
  {
    href: "/exercises",
    key: "exercises",
  },
];

/**
 * Home screen for WorkoutPilot
 * Acts as an entry point to Exercises
 */
const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { language, changeLanguage, supportedLanguages } = useAppLanguage();

  const languageLabels = {
    en: t("home.language.english"),
    es: t("home.language.spanish"),
  } as const;

  const languageOptions = supportedLanguages.map((code) => ({
    code,
    label: languageLabels[code],
  }));

  return (
    <ThemedView style={[styles.page, { paddingTop: 30 + insets.top }]}>
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t("home.title")}</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.heroContainer}>
        <ThemedText type="subtitle">{t("home.subtitle")}</ThemedText>
        <ThemedText>{t("home.description")}</ThemedText>
      </ThemedView>

      <ThemedView style={styles.languageContainer}>
        <ThemedText type="subtitle">{t("home.language.title")}</ThemedText>

        <LanguageSwitcher
          value={language}
          options={languageOptions}
          onChange={changeLanguage}
          hint={t("home.language.hint")}
        />
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        {actions.map((action) => (
          <Link key={action.key} href={action.href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed ? styles.actionCardPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={t(`home.actions.${action.key}.title`)}
              accessibilityHint={t(
                `home.actions.${action.key}.accessibilityHint`,
              )}
            >
              <ThemedText type="subtitle">
                {t(`home.actions.${action.key}.title`)}
              </ThemedText>
              <ThemedText>
                {t(`home.actions.${action.key}.description`)}
              </ThemedText>
            </Pressable>
          </Link>
        ))}
      </ThemedView>
    </ThemedView>
  );
};

export default HomeScreen;
