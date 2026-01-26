import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Card, Separator, XStack, YStack, useMedia, useTheme } from "tamagui";

import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TInput } from "@/components/TInput";
import { TTag } from "@/components/TTag";
import { useAuthStore } from "@/stores/authStore";

import styles from "./login.styles";

/**
 * Login screen - first entry point to the app
 * Collects and persists username before allowing access to the app
 */
const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const media = useMedia();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  const setStoredUsername = useAuthStore(
    (state: { setUsername: (username: string) => void }) => state.setUsername,
  );

  const validateUsername = (value: string): string => {
    if (!value.trim()) {
      return t("login.errorEmpty");
    }
    if (value.trim().length < 2) {
      return t("login.errorTooShort");
    }
    if (value.trim().length > 30) {
      return t("login.errorTooLong");
    }
    return "";
  };

  const handleContinue = () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStoredUsername(username.trim());
    // Navigate to onboarding screen
    router.replace("/onboarding");
  };

  const handleChangeText = (text: string) => {
    setUsername(text);
    if (error) {
      setError("");
    }
  };

  const isValid = username.trim().length >= 2 && username.trim().length <= 30;
  const badgeIconSize = media.gtSm ? 20 : 18;
  const cardPadding = media.gtSm ? "$6" : "$5";
  const gapSize = media.gtSm ? "$5" : "$4";

  const highlights = useMemo(
    () => [
      {
        icon: "shield-checkmark-outline" as const,
        text: t("login.highlights.secure"),
      },
      {
        icon: "flash-outline" as const,
        text: t("login.highlights.fast"),
      },
      {
        icon: "sparkles-outline" as const,
        text: t("login.highlights.personalized"),
      },
    ],
    [t],
  );

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
              />
            </YStack>
          </YStack>

          <Card
            padded
            bordered
            backgroundColor="$background"
            padding={cardPadding}
          >
            <YStack gap="$4">
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

              <Separator />

              <YStack
                gap="$3"
                padding="$3"
                borderRadius="$5"
                borderWidth={1}
                borderColor="$borderColor"
                backgroundColor="$background"
              >
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
              </YStack>

              <TButton
                fullWidth
                onPress={handleContinue}
                disabled={!isValid}
                iconAfterName="arrow-forward"
                iconColor={theme.color1?.val}
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
