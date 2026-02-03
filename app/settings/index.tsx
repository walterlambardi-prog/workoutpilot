import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { useTranslation } from "react-i18next";
import { XStack, YStack } from "tamagui";

import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TCard } from "@/components/TCard";
import { TPage } from "@/components/TPage";
import { TRow, TStack } from "@/components/TStack";
import { THeading, TText } from "@/components/TText";

import { useSettings } from "./hooks/useSettings";
import {
  ACTION_GAP,
  ACTION_ICON_SIZE,
  CARD_GAP,
  OPTION_ICON_SIZE,
  SECTION_GAP,
} from "./settings.styles";

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

/**
 * Settings screen for WorkoutPilot
 * Modernized with Tamagui components for a consistent, professional layout.
 */
const SettingsScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    language,
    themeMode,
    accentColor,
    dangerColor,
    languageOptions,
    themeOptions,
    dataActions,
    changeLanguage,
    setThemeMode,
  } = useSettings();

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
