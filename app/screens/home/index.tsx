import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { useTranslation } from "react-i18next";
import { Platform, Pressable } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppLanguage } from "@/hooks/useAppLanguage";
import styles from "./home.styles";
import type { HomeNavAction } from "./home.types";

const actions: HomeNavAction[] = [
  {
    href: "/explore",
    key: "explore",
  },
  {
    href: "/exercises",
    key: "exercises",
  },
];

/**
 * Home screen for WorkoutPilot
 * Acts as an entry point to Explore and Exercises
 */
const HomeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { language, changeLanguage, supportedLanguages } = useAppLanguage();

  const languageLabels = {
    en: t("home.language.english"),
    es: t("home.language.spanish"),
  } as const;

  const devToolsShortcut = Platform.select({
    ios: "cmd + d",
    android: "cmd + m",
    web: "F12",
    default: "F12",
  });

  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">{t("home.title")}</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.languageContainer}>
        <ThemedText type="subtitle">{t("home.language.title")}</ThemedText>
        <ThemedText>{t("home.language.description")}</ThemedText>
        <ThemedText type="defaultSemiBold">
          {t("home.language.system", { language: languageLabels[language] })}
        </ThemedText>

        <ThemedView style={styles.languageActions}>
          {supportedLanguages.map((code) => (
            <Pressable
              key={code}
              onPress={() => changeLanguage(code)}
              style={({ pressed }) => [
                styles.languageButton,
                language === code ? styles.languageButtonActive : null,
                pressed ? styles.actionCardPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={languageLabels[code]}
              accessibilityState={{ selected: language === code }}
              accessibilityHint={t("home.language.description")}
            >
              <ThemedText style={styles.languageButtonText}>
                {languageLabels[code]}
              </ThemedText>
            </Pressable>
          ))}
        </ThemedView>
      </ThemedView>

      <ThemedView style={styles.heroContainer}>
        <ThemedText type="subtitle">{t("home.subtitle")}</ThemedText>
        <ThemedText>{t("home.description")}</ThemedText>
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

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t("home.devShortcuts.title")}</ThemedText>
        <ThemedText>{t("home.devShortcuts.description")}</ThemedText>
        <ThemedText>
          {t("home.devShortcuts.devtools", { shortcut: devToolsShortcut })}
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">{t("home.reset.title")}</ThemedText>
        <ThemedText>{t("home.reset.description")}</ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default HomeScreen;
