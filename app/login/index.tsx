import React from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Card, XStack, YStack } from "tamagui";

import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TInput } from "@/components/TInput";
import { TTag } from "@/components/TTag";

import { useLogin } from "./hooks/useLogin";
import styles from "./login.styles";

/**
 * Login screen - first entry point to the app
 * Collects and persists username before allowing access to the app
 */
const LoginScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    username,
    error,
    isValid,
    theme,
    badgeIconSize,
    cardPadding,
    gapSize,
    highlights,
    handleContinue,
    handleChangeText,
  } = useLogin();

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.avoider}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$6"
        paddingVertical="$6"
        justifyContent="center"
      >
        <YStack width="100%" maxWidth={540} alignSelf="center" gap={gapSize}>
          <YStack gap="$4" alignItems="flex-start">
            <XStack
              gap="$3"
              alignItems="center"
              justifyContent="space-between"
              width="100%"
            >
              <TTag
                iconName="flash-outline"
                iconSize={badgeIconSize}
                label={t("login.subtitle")}
                tone="primary"
              />
            </XStack>
            <YStack gap="$2" alignItems="flex-start" width="100%">
              <ScreenHeader
                title={t("login.title")}
                subtitle={t("login.description")}
                titleShadow={{
                  color: theme.primary?.val,
                  radius: 4,
                  offset: { width: 0, height: 0 },
                }}
              />
            </YStack>
          </YStack>

          <Card
            padded
            bordered
            backgroundColor="$backgroundHover"
            padding={cardPadding}
          >
            <YStack gap="$6">
              <TInput
                label={t("login.inputLabel")}
                placeholder={t("login.inputPlaceholder")}
                value={username}
                onChangeText={handleChangeText}
                autoCapitalize="words"
                autoCorrect={false}
                maxLength={30}
                returnKeyType="done"
                onSubmitEditing={handleContinue}
                accessibilityHint={t("login.description")}
                error={error || undefined}
              />

              <XStack gap="$2" flexWrap="wrap">
                {highlights.map((item) => (
                  <TTag
                    key={item.icon}
                    iconName={item.icon}
                    iconSize={16}
                    label={item.text}
                    tone="neutral"
                  />
                ))}
              </XStack>

              <TButton
                fullWidth
                onPress={handleContinue}
                disabled={!isValid}
                accessibilityLabel={t("login.continueButton")}
                accessibilityState={{ disabled: !isValid }}
              >
                {t("login.continueButton")}
              </TButton>
            </YStack>
          </Card>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
