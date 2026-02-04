import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SpaceTokens } from "tamagui";
import { useMedia, useTheme } from "tamagui";

import { supabase } from "@/config/supabase";
import { useAuthStore } from "@/stores/authStore";

export const useLogin = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const media = useMedia();

  // Store
  const setHasCompletedOnboarding = useAuthStore(
    (state: { setHasCompletedOnboarding: (completed: boolean) => void }) =>
      state.setHasCompletedOnboarding,
  );

  // State
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);

  // Validation
  const validateEmail = (value: string): string => {
    if (!value.trim()) {
      return t("login.errorEmpty");
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      return t("login.errorInvalidEmail");
    }
    return "";
  };

  const validatePassword = (value: string): string => {
    if (!value) {
      return t("login.errorEmpty");
    }
    if (value.length < 6) {
      return t("login.errorPasswordTooShort");
    }
    return "";
  };

  const validateDisplayName = (value: string): string => {
    if (!value.trim()) {
      return t("login.errorEmpty");
    }
    if (value.trim().length < 2) {
      return t("login.errorDisplayNameTooShort");
    }
    return "";
  };

  // Computed values
  const isValid = isSignUp
    ? displayName.trim().length >= 2 &&
      email.trim().length > 0 &&
      password.length >= 6 &&
      validateDisplayName(displayName) === "" &&
      validateEmail(email) === "" &&
      validatePassword(password) === ""
    : email.trim().length > 0 &&
      password.length >= 6 &&
      validateEmail(email) === "" &&
      validatePassword(password) === "";

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
  const handleSignIn = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (emailError || passwordError) {
      setError(emailError || passwordError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (signInError) {
        setError(t("login.errorSignInFailed"));
        return;
      }

      // Sign in: don't touch hasCompletedOnboarding (persisted value remains)
      // Navigation handled by _layout.tsx auth listener
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("login.errorSignInFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async () => {
    const displayNameError = validateDisplayName(displayName);
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);

    if (displayNameError || emailError || passwordError) {
      setError(displayNameError || emailError || passwordError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            display_name: displayName.trim(),
          },
        },
      });

      if (signUpError) {
        setError(t("login.errorSignUpFailed"));
        return;
      }

      // If email confirmation is required, show success message
      if (!data.session) {
        setError(""); // Clear any previous errors
        // Note: You might want to show a success toast here
        // For now, we'll just switch to sign in mode
        setIsSignUp(false);
      } else {
        // Update user metadata to ensure display_name is saved
        await supabase.auth.updateUser({
          data: {
            display_name: displayName.trim(),
          },
        });

        // Mark as NOT completed onboarding to show it for new users
        setHasCompletedOnboarding(false);
        // Navigation handled by _layout.tsx auth listener
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : t("login.errorSignUpFailed"),
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChangeDisplayName = (text: string) => {
    setDisplayName(text);
    if (error) {
      setError("");
    }
  };

  const handleChangeEmail = (text: string) => {
    setEmail(text);
    if (error) {
      setError("");
    }
  };

  const handleChangePassword = (text: string) => {
    setPassword(text);
    if (error) {
      setError("");
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setDisplayName("");
    setError("");
  };

  return {
    // State
    displayName,
    email,
    password,
    error,
    loading,
    isValid,
    isSignUp,

    // Theme
    theme,
    badgeIconSize,
    cardPadding,
    gapSize,

    // Data
    highlights,

    // Actions
    handleSignIn,
    handleSignUp,
    handleChangeDisplayName,
    handleChangeEmail,
    handleChangePassword,
    toggleMode,
  };
};
