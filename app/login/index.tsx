import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";
import { Card, Separator, XStack, YStack, useMedia, useTheme } from "tamagui";

import { TButton } from "@/components/TButton";
import { TInput } from "@/components/TInput";
import { TTag } from "@/components/TTag";
import { THeading, TText } from "@/components/TText";
import { useAuthStore } from "@/stores/authStore";

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
  const accentColor =
    theme.primary?.val ?? theme.color10?.val ?? theme.color?.val;

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
  const headingSize = media.gtSm ? "$8" : "$7";
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
      style={{ flex: 1 }}
    >
      <YStack
        flex={1}
        backgroundColor="$background"
        paddingHorizontal="$4"
        paddingVertical="$6"
        justifyContent="center"
      >
        <YStack width="100%" maxWidth={540} alignSelf="center" gap={gapSize}>
          <YStack gap="$3" alignItems="flex-start">
            <TTag
              iconName="flash-outline"
              iconSize={badgeIconSize}
              label={t("login.subtitle")}
              tone="primary"
            />
            <THeading level={1} fontSize={headingSize} fontWeight="800">
              {t("login.title")}
            </THeading>
            <TText opacity={0.8}>{t("login.description")}</TText>
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

              <YStack gap="$3">
                {highlights.map((item) => (
                  <XStack key={item.icon} gap="$2" alignItems="center">
                    <Ionicons
                      name={item.icon}
                      size={18}
                      color={accentColor}
                      accessibilityElementsHidden
                    />
                    <TText variant="label" opacity={0.85}>
                      {item.text}
                    </TText>
                  </XStack>
                ))}
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
