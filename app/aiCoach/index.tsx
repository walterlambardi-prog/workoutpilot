import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
    ActivityIndicator,
    Keyboard,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { EXERCISE_COPY_KEYS } from "@/constants/exercises";
import { useThemeColor } from "@/hooks/useThemeColor";
import { styles } from "./aiCoach.styles";
import type {
    LevelPrompt,
    ParsedRoutinePlan,
    ProfilePrompt,
} from "./aiCoach.types";
import {
    parseJsonPlan,
    parseLevelPrompt,
    parseProfilePrompt,
    useAiCoach,
} from "./useAiCoach";

const AiCoachScreen = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const {
    input,
    setInput,
    loading,
    messages,
    suggestions,
    handleSend,
    createSuggestionHandler,
    handleStartRoutineFromPlan,
    handleEditRoutineFromPlan,
    handleLevelSelect,
    handleProfileSubmit,
  } = useAiCoach();

  const backgroundColor = useThemeColor({}, "background");
  const textPrimary = useThemeColor({}, "text");
  const surfaceColor = useThemeColor(
    { light: "#f8fafc", dark: "#0b1220" },
    "background",
  );
  const secondarySurface = useThemeColor(
    { light: "#e2f3ff", dark: "#0f172a" },
    "background",
  );
  const userSurface = useThemeColor(
    { light: "#e6ffed", dark: "rgba(34,211,238,0.16)" },
    "background",
  );
  const borderColor = useThemeColor(
    { light: "#e2e8f0", dark: "#1f2937" },
    "background",
  );
  const subtleText = useThemeColor(
    { light: "#475569", dark: "#94a3b8" },
    "text",
  );
  const accent = useThemeColor({ light: "#0284c7", dark: "#22d3ee" }, "tint");
  const chipBg = useThemeColor(
    { light: "#e2e8f0", dark: "#0f172a" },
    "background",
  );
  const chipBorder = useThemeColor(
    { light: "#cbd5e1", dark: "rgba(255,255,255,0.12)" },
    "background",
  );
  const inputBarColor = useThemeColor(
    { light: "rgba(255,255,255,0.95)", dark: "rgba(7,15,38,0.98)" },
    "background",
  );

  const [profileAge, setProfileAge] = useState("");
  const [profileFrequency, setProfileFrequency] = useState("");

  const handleSendWithDismiss = () => {
    handleSend();
    Keyboard.dismiss();
  };

  const formatTime = useMemo(
    () => (timestamp?: number) => {
      const date = timestamp ? new Date(timestamp) : new Date();
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    [],
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 40);
    return () => clearTimeout(timer);
  }, [messages]);

  const lastProfilePromptId = useMemo(() => {
    let found: string | null = null;
    messages.forEach((msg) => {
      if (msg.role === "assistant" && parseProfilePrompt(msg.content)) {
        found = msg.id;
      }
    });
    return found;
  }, [messages]);

  const lastLevelPromptId = useMemo(() => {
    let found: string | null = null;
    messages.forEach((msg) => {
      if (msg.role === "assistant" && parseLevelPrompt(msg.content)) {
        found = msg.id;
      }
    });
    return found;
  }, [messages]);

  const renderPlan = (parsed: ParsedRoutinePlan) => (
    <View style={styles.planPreview}>
      <View style={styles.planHeader}>
        <Text style={[styles.planTitle, { color: textPrimary }]}>
          {t("aiCoach.planExercisesTitle")}
        </Text>
        <View
          style={[
            styles.planBadge,
            {
              backgroundColor: `${accent}26`,
              borderColor: accent,
            },
          ]}
        >
          <Text style={[styles.planBadgeText, { color: accent }]}>
            {t("aiCoach.planRoundsLabel", { rounds: parsed.rounds ?? 1 })}
          </Text>
        </View>
      </View>
      <View style={styles.planList}>
        {parsed.plan.map((item, idx) => {
          const copyKey = EXERCISE_COPY_KEYS[item.exerciseId];
          const exerciseLabel = t(`${copyKey}.title`);
          return (
            <View style={styles.planRow} key={`${item.exerciseId}-${idx}`}>
              <View style={[styles.planDot, { backgroundColor: accent }]} />
              <Text style={[styles.assistantText, { color: textPrimary }]}>
                {t("aiCoach.planExerciseLine", {
                  exercise: exerciseLabel,
                  reps: item.targetReps,
                })}
              </Text>
            </View>
          );
        })}
      </View>
      <View style={styles.planActions}>
        <Pressable
          style={({ pressed }) => [
            styles.planActionButton,
            { backgroundColor: accent },
            pressed ? { opacity: 0.9 } : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("aiCoach.usePlanCta")}
          onPress={() => handleStartRoutineFromPlan(parsed.plan, parsed.rounds)}
        >
          <Text style={[styles.planActionText, { color: "#0b122f" }]}>
            {t("aiCoach.usePlanCta")}
          </Text>
        </Pressable>
        <Pressable
          style={({ pressed }) => [
            styles.planActionGhost,
            { borderColor, backgroundColor: surfaceColor },
            pressed ? { opacity: 0.9 } : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={t("aiCoach.editPlanCta")}
          onPress={() => handleEditRoutineFromPlan(parsed.plan, parsed.rounds)}
        >
          <Text style={[styles.planActionGhostText, { color: textPrimary }]}>
            {t("aiCoach.editPlanCta")}
          </Text>
        </Pressable>
      </View>
    </View>
  );

  const renderLevelPrompt = (levelPrompt: LevelPrompt, disabled: boolean) => (
    <View style={styles.profilePrompt}>
      <Text style={[styles.levelPromptTitle, { color: textPrimary }]}>
        {levelPrompt.prompt?.trim() || t("aiCoach.levelPromptFallback")}
      </Text>
      <View style={styles.levelOptions}>
        {levelPrompt.options.map((option) => (
          <Pressable
            key={option}
            style={({ pressed }) => [
              styles.levelOptionButton,
              {
                backgroundColor: accent,
                borderColor: accent,
              },
              pressed ? { opacity: 0.92 } : null,
              disabled ? styles.profileSubmitDisabled : null,
            ]}
            accessibilityRole="button"
            accessibilityLabel={option}
            disabled={disabled}
            onPress={() => handleLevelSelect(option)}
          >
            <Text style={[styles.levelOptionText, { color: "#0b122f" }]}>
              {option}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  const renderProfilePrompt = (
    profilePrompt: ProfilePrompt,
    disabled: boolean,
    isActive: boolean,
  ) => {
    const activeAge = isActive ? profileAge : "";
    const activeFrequency = isActive ? profileFrequency : "";
    const hasAnyValue =
      activeAge.trim().length > 0 || activeFrequency.trim().length > 0;
    const showAgeField = profilePrompt.needAge !== false;
    const showFrequencyField = profilePrompt.needFrequency !== false;
    return (
      <View style={styles.profilePrompt}>
        <Text
          style={[styles.profilePromptTitle, { color: textPrimary }]}
          accessibilityRole="header"
        >
          {profilePrompt.prompt?.trim() || t("aiCoach.profilePromptFallback")}
        </Text>
        <View style={styles.profileFields}>
          {showAgeField ? (
            <View style={styles.profileFieldBlock}>
              <Text
                style={[styles.profileFieldLabel, { color: subtleText }]}
                accessibilityLabel={t("aiCoach.profileAgeLabel")}
              >
                {profilePrompt.ageLabel || t("aiCoach.profileAgeLabel")}
              </Text>
              <TextInput
                value={activeAge}
                onChangeText={isActive ? setProfileAge : undefined}
                placeholder={t("aiCoach.profileAgePlaceholder")}
                placeholderTextColor={subtleText}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={3}
                style={[
                  styles.profileInput,
                  { color: textPrimary, borderColor },
                ]}
                editable={!disabled}
                accessible
                accessibilityLabel={t("aiCoach.profileAgeLabel")}
              />
            </View>
          ) : null}
          {showFrequencyField ? (
            <View style={styles.profileFieldBlock}>
              <Text
                style={[styles.profileFieldLabel, { color: subtleText }]}
                accessibilityLabel={t("aiCoach.profileFrequencyLabel")}
              >
                {profilePrompt.frequencyLabel ||
                  t("aiCoach.profileFrequencyLabel")}
              </Text>
              <TextInput
                value={activeFrequency}
                onChangeText={isActive ? setProfileFrequency : undefined}
                placeholder={t("aiCoach.profileFrequencyPlaceholder")}
                placeholderTextColor={subtleText}
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={2}
                style={[
                  styles.profileInput,
                  { color: textPrimary, borderColor },
                ]}
                editable={!disabled}
                accessible
                accessibilityLabel={t("aiCoach.profileFrequencyLabel")}
              />
            </View>
          ) : null}
        </View>
        <Pressable
          style={({ pressed }) => [
            styles.profileSubmit,
            { backgroundColor: accent },
            pressed && hasAnyValue ? { opacity: 0.9 } : null,
            !hasAnyValue || disabled ? styles.profileSubmitDisabled : null,
          ]}
          accessibilityRole="button"
          accessibilityLabel={
            profilePrompt.submitLabel || t("aiCoach.profileSubmit")
          }
          disabled={!hasAnyValue || loading || disabled}
          onPress={() => {
            handleProfileSubmit(profileAge, profileFrequency);
            Keyboard.dismiss();
            setProfileAge("");
            setProfileFrequency("");
          }}
        >
          <Text
            style={[styles.profileSubmitText, { color: "#0b122f" }]}
            accessibilityLabel={
              profilePrompt.submitLabel || t("aiCoach.profileSubmit")
            }
          >
            {profilePrompt.submitLabel || t("aiCoach.profileSubmit")}
          </Text>
        </Pressable>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top + 12}
    >
      <View style={[styles.container, { backgroundColor }]}>
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() =>
            scrollRef.current?.scrollToEnd({ animated: true })
          }
        >
          <ThemedView style={styles.header}>
            <ThemedText style={styles.title} type="title">
              {t("aiCoach.title")}
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              {t("aiCoach.screenSubtitle")}
            </ThemedText>
          </ThemedView>

          <View style={styles.suggestionsWrap}>
            {suggestions.map((item) => (
              <Pressable
                key={item.id}
                style={({ pressed }) => [
                  styles.suggestionChip,
                  {
                    backgroundColor: chipBg,
                    borderColor: chipBorder,
                  },
                  pressed ? { opacity: 0.9 } : null,
                ]}
                onPress={createSuggestionHandler(item.text)}
                accessibilityRole="button"
                accessibilityLabel={item.text}
              >
                <Text style={[styles.suggestionText, { color: textPrimary }]}>
                  {item.text}
                </Text>
              </Pressable>
            ))}
          </View>

          <View
            style={[
              styles.messagesCard,
              { backgroundColor: surfaceColor, borderColor },
            ]}
          >
            {messages.map((message) => {
              const parsedLevelPrompt =
                message.role === "assistant"
                  ? parseLevelPrompt(message.content)
                  : null;
              const parsedProfilePrompt =
                message.role === "assistant"
                  ? parseProfilePrompt(message.content)
                  : null;
              const parsedMessagePlan =
                message.role === "assistant"
                  ? parseJsonPlan(message.content)
                  : null;

              const justify =
                message.role === "user" ? "flex-end" : "flex-start";
              const bubbleStyle =
                message.role === "user"
                  ? [
                      styles.bubbleUser,
                      { backgroundColor: userSurface, borderColor: accent },
                    ]
                  : [
                      styles.bubbleAssistant,
                      {
                        backgroundColor: secondarySurface,
                        borderColor: accent,
                        shadowColor: accent,
                      },
                    ];
              const metaNameStyle =
                message.role === "user"
                  ? [styles.metaNameUser, { color: textPrimary }]
                  : [styles.metaName, { color: subtleText }];
              const metaTimeStyle =
                message.role === "user"
                  ? [styles.metaTimeUser, { color: subtleText }]
                  : [styles.metaTime, { color: subtleText }];
              const bodyStyle =
                message.role === "user"
                  ? [styles.userText, { color: textPrimary }]
                  : [styles.assistantText, { color: textPrimary }];

              return (
                <View
                  key={message.id}
                  style={[styles.messageRow, { justifyContent: justify }]}
                >
                  <View style={bubbleStyle}>
                    <View style={[styles.metaRow, { justifyContent: justify }]}>
                      <Text style={metaNameStyle}>
                        {message.role === "user"
                          ? t("aiCoach.meLabel")
                          : t("aiCoach.coachLabel")}
                      </Text>
                      <Text style={metaTimeStyle}>
                        {formatTime(message.createdAt)}
                      </Text>
                    </View>

                    {parsedProfilePrompt ? (
                      renderProfilePrompt(
                        parsedProfilePrompt,
                        message.id !== lastProfilePromptId,
                        message.id === lastProfilePromptId,
                      )
                    ) : parsedLevelPrompt ? (
                      renderLevelPrompt(
                        parsedLevelPrompt,
                        message.id !== lastLevelPromptId,
                      )
                    ) : parsedMessagePlan ? (
                      renderPlan(parsedMessagePlan)
                    ) : (
                      <Text style={bodyStyle}>{message.content}</Text>
                    )}
                  </View>
                </View>
              );
            })}

            {loading ? (
              <View style={styles.statusRow}>
                <ActivityIndicator size="small" color={accent} />
                <Text style={[styles.statusText, { color: subtleText }]}>
                  {t("aiCoach.thinking")}
                </Text>
              </View>
            ) : null}
          </View>
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            {
              paddingBottom: insets.bottom + 12,
              backgroundColor: inputBarColor,
              borderColor,
            },
          ]}
        >
          <View
            style={[
              styles.inputInner,
              { backgroundColor: surfaceColor, borderColor },
            ]}
          >
            <TextInput
              value={input}
              onChangeText={setInput}
              placeholder={t("aiCoach.inputPlaceholder")}
              placeholderTextColor={subtleText}
              style={[styles.textInput, { color: textPrimary }]}
              returnKeyType="send"
              onSubmitEditing={handleSendWithDismiss}
              blurOnSubmit
              editable={!loading}
              multiline
            />
            <Pressable
              onPress={handleSendWithDismiss}
              disabled={loading || !input.trim().length}
              accessibilityRole="button"
              accessibilityLabel={t("aiCoach.sendLabel")}
              style={({ pressed }) => [
                styles.sendButton,
                { backgroundColor: accent },
                loading || !input.trim().length
                  ? styles.sendButtonDisabled
                  : null,
                pressed && !loading && input.trim().length
                  ? { opacity: 0.92 }
                  : null,
              ]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#0b122f" />
              ) : (
                <Ionicons name="send" size={18} color="#0b122f" />
              )}
            </Pressable>
          </View>
          <View style={{ height: insets.bottom > 0 ? insets.bottom / 2 : 0 }} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default AiCoachScreen;
