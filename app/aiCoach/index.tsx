import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyboardAvoidingView, Platform } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Button,
  Card,
  Input,
  ScrollView,
  Separator,
  Text,
  XStack,
  YStack,
  useMedia,
  useTheme,
} from "tamagui";

import ScreenHeader from "@/components/ScreenHeader";
import { TButton } from "@/components/TButton";
import { TInput } from "@/components/TInput";
import { TTag } from "@/components/TTag";
import { EXERCISE_COPY_KEYS } from "@/constants/exercises";

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

const AiCoachScreen: React.FC = () => {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const media = useMedia();
  const theme = useTheme();
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

  const [profileAge, setProfileAge] = useState("");
  const [profileFrequency, setProfileFrequency] = useState("");

  const titleSize = media.md ? "$5" : "$4";
  const bodySize = media.md ? "$4" : "$3";
  const labelSize = media.md ? "$4" : "$3";
  const metaSize = media.md ? "$3" : "$2";
  const sendIconColor =
    (theme as { onPrimary?: { val?: string } }).onPrimary?.val || "#0f172a";

  const handleSendWithDismiss = () => {
    handleSend();
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
    }, 50);
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
    <Card
      bordered
      padding="$4"
      backgroundColor="$background"
      borderColor="$borderColor"
      gap="$3"
    >
      <XStack alignItems="center" justifyContent="space-between" gap="$3">
        <Text fontSize={titleSize} fontWeight="700" color="$color">
          {t("aiCoach.planExercisesTitle")}
        </Text>
        <TTag
          iconName="barbell-outline"
          label={t("aiCoach.planRoundsLabel", { rounds: parsed.rounds ?? 1 })}
          tone="neutral"
        />
      </XStack>

      <YStack gap="$3">
        {parsed.plan.map((item, idx) => {
          const copyKey = EXERCISE_COPY_KEYS[item.exerciseId];
          const exerciseLabel = t(`${copyKey}.title`);
          return (
            <XStack
              key={`${item.exerciseId}-${idx}`}
              gap="$3"
              alignItems="center"
            >
              <YStack
                width={8}
                height={8}
                borderRadius={9999}
                backgroundColor="$primary"
              />
              <Text fontSize={bodySize} lineHeight={20} color="$color">
                {t("aiCoach.planExerciseLine", {
                  exercise: exerciseLabel,
                  reps: item.targetReps,
                })}
              </Text>
            </XStack>
          );
        })}
      </YStack>

      <XStack gap="$3" flexWrap="wrap">
        <TButton
          onPress={() => handleStartRoutineFromPlan(parsed.plan, parsed.rounds)}
          accessibilityLabel={t("aiCoach.usePlanCta")}
        >
          {t("aiCoach.usePlanCta")}
        </TButton>
        <TButton
          variant="outline"
          onPress={() => handleEditRoutineFromPlan(parsed.plan, parsed.rounds)}
          accessibilityLabel={t("aiCoach.editPlanCta")}
        >
          {t("aiCoach.editPlanCta")}
        </TButton>
      </XStack>
    </Card>
  );

  const renderLevelPrompt = (levelPrompt: LevelPrompt, disabled: boolean) => (
    <Card bordered padding="$4" gap="$3" backgroundColor="$backgroundHover">
      <Text fontSize={titleSize} fontWeight="700" color="$color">
        {levelPrompt.prompt?.trim() || t("aiCoach.levelPromptFallback")}
      </Text>
      <XStack gap="$2" flexWrap="wrap">
        {levelPrompt.options.map((option) => (
          <Button
            key={option}
            size="$3"
            backgroundColor="$primary"
            color="$onPrimary"
            borderColor="$primary"
            disabled={disabled}
            onPress={() => handleLevelSelect(option)}
          >
            {option}
          </Button>
        ))}
      </XStack>
    </Card>
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

    const handleSubmit = () => {
      handleProfileSubmit(profileAge, profileFrequency);
      setProfileAge("");
      setProfileFrequency("");
    };

    return (
      <Card bordered padding="$4" gap="$4" backgroundColor="$backgroundHover">
        <Text fontSize={titleSize} fontWeight="700" color="$color">
          {profilePrompt.prompt?.trim() || t("aiCoach.profilePromptFallback")}
        </Text>
        <XStack gap="$3" flexWrap="wrap">
          {showAgeField ? (
            <YStack flex={1} minWidth={160} gap="$2">
              <Text fontSize={metaSize} fontWeight="700" color="$color">
                {profilePrompt.ageLabel || t("aiCoach.profileAgeLabel")}
              </Text>
              <TInput
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={3}
                value={activeAge}
                onChangeText={isActive ? setProfileAge : undefined}
                placeholder={t("aiCoach.profileAgePlaceholder")}
                accessibilityLabel={t("aiCoach.profileAgeLabel")}
              />
            </YStack>
          ) : null}

          {showFrequencyField ? (
            <YStack flex={1} minWidth={160} gap="$2">
              <Text fontSize={metaSize} fontWeight="700" color="$color">
                {profilePrompt.frequencyLabel ||
                  t("aiCoach.profileFrequencyLabel")}
              </Text>
              <TInput
                keyboardType="number-pad"
                inputMode="numeric"
                maxLength={2}
                value={activeFrequency}
                onChangeText={isActive ? setProfileFrequency : undefined}
                placeholder={t("aiCoach.profileFrequencyPlaceholder")}
                accessibilityLabel={t("aiCoach.profileFrequencyLabel")}
              />
            </YStack>
          ) : null}
        </XStack>

        <TButton
          onPress={handleSubmit}
          disabled={!hasAnyValue || loading || disabled}
          accessibilityLabel={
            profilePrompt.submitLabel || t("aiCoach.profileSubmit")
          }
        >
          {profilePrompt.submitLabel || t("aiCoach.profileSubmit")}
        </TButton>
      </Card>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.avoider}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={insets.top + 12}
    >
      <YStack flex={1} backgroundColor="$background">
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
          <ScreenHeader
            title={t("aiCoach.title")}
            subtitle={t("aiCoach.screenSubtitle")}
          />

          <XStack gap="$2" flexWrap="wrap">
            {suggestions.map((item) => (
              <Button
                key={item.id}
                size="$3"
                backgroundColor="$backgroundHover"
                color="$color"
                borderColor="$borderColor"
                borderWidth={1}
                onPress={createSuggestionHandler(item.text)}
                accessibilityLabel={item.text}
              >
                {item.text}
              </Button>
            ))}
          </XStack>

          <Card
            bordered
            padding="$4"
            backgroundColor="$background"
            borderColor="$borderColor"
            gap="$4"
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
              const parsedPlan =
                message.role === "assistant"
                  ? parseJsonPlan(message.content)
                  : null;
              const isUser = message.role === "user";

              if (parsedPlan) {
                return (
                  <YStack key={message.id} gap="$3">
                    <XStack gap="$2" alignItems="center">
                      <Text
                        fontSize={labelSize}
                        fontWeight="700"
                        color="$color"
                      >
                        {t("aiCoach.coachLabel")}
                      </Text>
                      <Separator vertical />
                      <Text fontSize={metaSize} color="$color" opacity={0.7}>
                        {formatTime(message.createdAt)}
                      </Text>
                    </XStack>
                    {renderPlan(parsedPlan)}
                  </YStack>
                );
              }

              if (parsedLevelPrompt) {
                const isMostRecent = lastLevelPromptId === message.id;
                return (
                  <YStack key={message.id} gap="$3">
                    <XStack gap="$2" alignItems="center">
                      <Text
                        fontSize={labelSize}
                        fontWeight="700"
                        color="$color"
                      >
                        {t("aiCoach.coachLabel")}
                      </Text>
                      <Separator vertical />
                      <Text fontSize={metaSize} color="$color" opacity={0.7}>
                        {formatTime(message.createdAt)}
                      </Text>
                    </XStack>
                    {renderLevelPrompt(
                      parsedLevelPrompt,
                      loading || !isMostRecent,
                    )}
                  </YStack>
                );
              }

              if (parsedProfilePrompt) {
                const isMostRecentProfilePrompt =
                  lastProfilePromptId === message.id;
                return (
                  <YStack key={message.id} gap="$3">
                    <XStack gap="$2" alignItems="center">
                      <Text
                        fontSize={labelSize}
                        fontWeight="700"
                        color="$color"
                      >
                        {t("aiCoach.coachLabel")}
                      </Text>
                      <Separator vertical />
                      <Text fontSize={metaSize} color="$color" opacity={0.7}>
                        {formatTime(message.createdAt)}
                      </Text>
                    </XStack>
                    {renderProfilePrompt(
                      parsedProfilePrompt,
                      loading || !isMostRecentProfilePrompt,
                      isMostRecentProfilePrompt,
                    )}
                  </YStack>
                );
              }

              const bubbleColor = isUser
                ? "$backgroundPress"
                : "$backgroundHover";
              const bubbleText = "$color";
              const bubbleBorder = isUser
                ? "$borderColorHover"
                : "$borderColor";

              return (
                <YStack
                  key={message.id}
                  gap="$2"
                  alignItems={isUser ? "flex-end" : "flex-start"}
                >
                  <XStack gap="$2" alignItems="center">
                    <Text fontSize={labelSize} fontWeight="700" color="$color">
                      {isUser ? t("aiCoach.meLabel") : t("aiCoach.coachLabel")}
                    </Text>
                    <Separator vertical />
                    <Text fontSize={metaSize} color="$color" opacity={0.7}>
                      {formatTime(message.createdAt)}
                    </Text>
                  </XStack>
                  <YStack
                    padding="$3"
                    borderRadius="$4"
                    backgroundColor={bubbleColor}
                    borderColor={bubbleBorder}
                    borderWidth={1}
                    maxWidth="92%"
                  >
                    <Text
                      fontSize={bodySize}
                      lineHeight={20}
                      color={bubbleText}
                    >
                      {message.content}
                    </Text>
                  </YStack>
                </YStack>
              );
            })}
          </Card>

          {loading ? (
            <XStack gap="$2" alignItems="center" paddingVertical="$2">
              <Ionicons
                name="sparkles-outline"
                size={16}
                color="gray"
                accessibilityElementsHidden
              />
              <Text fontSize={metaSize} color="$color" opacity={0.7}>
                {t("aiCoach.thinking")}
              </Text>
            </XStack>
          ) : null}
        </ScrollView>

        <Card
          borderColor="$borderColor"
          backgroundColor="$background"
          padding="$3"
          borderRadius="$6"
          style={[styles.inputBar, { paddingBottom: insets.bottom + 12 }]}
        >
          <XStack alignItems="center" gap="$3">
            <Input
              flex={1}
              size="$5"
              value={input}
              onChangeText={setInput}
              placeholder={t("aiCoach.inputPlaceholder")}
              placeholderTextColor="$color10"
              autoCapitalize="sentences"
              autoCorrect
              accessibilityLabel={t("aiCoach.inputPlaceholder")}
            />
            <Button
              size="$5"
              backgroundColor="$primary"
              color="$onPrimary"
              borderColor="$primary"
              icon={
                <Ionicons
                  name="arrow-up"
                  size={18}
                  color={sendIconColor}
                  accessibilityElementsHidden
                />
              }
              onPress={handleSendWithDismiss}
              disabled={loading || !input.trim().length}
              accessibilityLabel={t("aiCoach.sendLabel")}
            />
          </XStack>
        </Card>
      </YStack>
    </KeyboardAvoidingView>
  );
};

export default AiCoachScreen;
