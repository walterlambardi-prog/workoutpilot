import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SpaceTokens } from "tamagui";
import { useMedia, useTheme } from "tamagui";

import { useAuthStore } from "@/stores/authStore";

export const useLogin = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const theme = useTheme();
  const media = useMedia();

  // State
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");

  // Store actions
  const setStoredUsername = useAuthStore(
    (state: { setUsername: (username: string) => void }) => state.setUsername,
  );

  // Validation
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

  // Computed values
  const isValid = username.trim().length >= 2 && username.trim().length <= 30;

  // Responsive sizes
  const badgeIconSize = media.gtSm ? 20 : 18;
  const cardPadding: SpaceTokens = media.gtSm ? "$6" : "$5";
  const gapSize: SpaceTokens = media.gtSm ? "$5" : "$4";

  // Highlights data
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

  // Event handlers
  const handleContinue = () => {
    const validationError = validateUsername(username);
    if (validationError) {
      setError(validationError);
      return;
    }

    setStoredUsername(username.trim());
    router.replace("/onboarding");
  };

  const handleChangeText = (text: string) => {
    setUsername(text);
    if (error) {
      setError("");
    }
  };

  return {
    // State
    username,
    error,
    isValid,

    // Theme
    theme,
    badgeIconSize,
    cardPadding,
    gapSize,

    // Data
    highlights,

    // Actions
    handleContinue,
    handleChangeText,
  };
};
