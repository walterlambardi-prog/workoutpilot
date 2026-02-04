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
 * Login screen - authentication with email/password
 * Supports both sign in and sign up flows with Supabase Auth
 */
const LoginScreen: React.FC = () => {
  const { t } = useTranslation();

  const {
    displayName,
    email,
    password,
    error,
    loading,
    isValid,
    isSignUp,
    theme,
    badgeIconSize,
    cardPadding,
    gapSize,
    highlights,
    handleSignIn,
    handleSignUp,
    handleChangeDisplayName,
    handleChangeEmail,
    handleChangePassword,
    toggleMode,
  } = useLogin();

  const handleSubmit = isSignUp ? handleSignUp : handleSignIn;

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
            <YStack gap="$3">
              {isSignUp && (
                <TInput
                  label={t("login.displayNameLabel")}
                  placeholder={t("login.displayNamePlaceholder")}
                  value={displayName}
                  onChangeText={handleChangeDisplayName}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                  accessibilityHint={t("login.displayNameLabel")}
                />
              )}

              <TInput
                label={t("login.emailLabel")}
                placeholder={t("login.emailPlaceholder")}
                value={email}
                onChangeText={handleChangeEmail}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                returnKeyType="next"
                accessibilityHint={t("login.description")}
                error={error || undefined}
              />

              <TInput
                label={t("login.passwordLabel")}
                placeholder={t("login.passwordPlaceholder")}
                value={password}
                onChangeText={handleChangePassword}
                autoCapitalize="none"
                autoCorrect={false}
                secureTextEntry
                returnKeyType="done"
                onSubmitEditing={handleSubmit}
                accessibilityHint={t("login.description")}
              />

              <XStack gap="$2" flexWrap="wrap" marginTop="$2">
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
                onPress={handleSubmit}
                disabled={!isValid || loading}
                accessibilityLabel={
                  isSignUp ? t("login.signUpButton") : t("login.signInButton")
                }
                accessibilityState={{ disabled: !isValid || loading }}
              >
                {loading
                  ? "..."
                  : isSignUp
                    ? t("login.signUpButton")
                    : t("login.signInButton")}
              </TButton>

              <TButton
                fullWidth
                variant="outline"
                onPress={toggleMode}
                disabled={loading}
              >
                {isSignUp
                  ? t("login.switchToSignIn")
                  : t("login.switchToSignUp")}
              </TButton>
            </YStack>
          </Card>
        </YStack>
      </YStack>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
