import { useRouter } from "expo-router";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/ThemedText";
import { useThemeColor } from "@/hooks/useThemeColor";
import { useAuthStore } from "@/stores/authStore";

import styles from "./login.styles";

/**
 * Login screen - first entry point to the app
 * Collects and persists username before allowing access to the app
 */
const LoginScreen: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  const setStoredUsername = useAuthStore(
    (state: { setUsername: (username: string) => void }) => state.setUsername,
  );
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const borderColor = useThemeColor({}, "tint");
  const inputBackgroundColor = useThemeColor(
    { light: "#f3f4f6", dark: "#1f2937" },
    "background",
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, { backgroundColor }]}
    >
      <View style={styles.content}>
        <View style={styles.header}>
          <ThemedText style={styles.title} type="title">
            {t("login.title")}
          </ThemedText>
          <ThemedText style={styles.subtitle} type="subtitle">
            {t("login.subtitle")}
          </ThemedText>
          <ThemedText style={styles.description}>
            {t("login.description")}
          </ThemedText>
        </View>

        <View style={styles.form}>
          <View style={styles.inputContainer}>
            <ThemedText style={styles.label}>
              {t("login.inputLabel")}
            </ThemedText>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: inputBackgroundColor,
                  borderColor: error
                    ? "#ef4444"
                    : isFocused
                      ? borderColor
                      : "transparent",
                  color: textColor,
                },
                isFocused && styles.inputFocused,
              ]}
              value={username}
              onChangeText={handleChangeText}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={t("login.inputPlaceholder")}
              placeholderTextColor={textColor + "80"}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={30}
              returnKeyType="done"
              onSubmitEditing={handleContinue}
              accessibilityLabel={t("login.inputLabel")}
              accessibilityHint={t("login.description")}
            />
            {error ? (
              <ThemedText style={styles.errorText}>{error}</ThemedText>
            ) : null}
          </View>

          <Pressable
            onPress={handleContinue}
            disabled={!isValid}
            style={({ pressed }) => [
              styles.button,
              !isValid && styles.buttonDisabled,
              pressed && styles.buttonPressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel={t("login.continueButton")}
            accessibilityState={{ disabled: !isValid }}
          >
            <ThemedText style={styles.buttonText}>
              {t("login.continueButton")}
            </ThemedText>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
