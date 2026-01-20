import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, View } from "react-native";

import { ThemedText } from "@/components/themedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import styles from "./ActionCard.styles";
import type { ActionCardProps } from "./ActionCard.types";

const ActionCard: React.FC<ActionCardProps> = ({
  title,
  subtitle,
  icon,
  iconColor,
  accessibilityHint,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const cardTone = colorScheme === "dark" ? styles.cardDark : styles.cardLight;
  const iconContainerTone =
    colorScheme === "dark"
      ? styles.iconContainerDark
      : styles.iconContainerLight;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        cardTone,
        pressed ? styles.cardPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
    >
      <View
        style={[
          styles.iconContainer,
          iconContainerTone,
          { backgroundColor: `${iconColor}20` },
        ]}
      >
        <Ionicons
          name={icon as keyof typeof Ionicons.glyphMap}
          size={32}
          color={iconColor}
        />
      </View>
      <View style={styles.content}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>
      </View>
    </Pressable>
  );
};

export default ActionCard;
