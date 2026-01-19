import React from "react";
import { Image, Pressable, View } from "react-native";

import { ThemedText } from "@/components/themedText";
import { useColorScheme } from "@/hooks/useColorScheme";
import styles from "./ExerciseCard.styles";
import type { ExerciseCardProps } from "./ExerciseCard.types";

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  title,
  description,
  cta,
  image,
  accessibilityHint,
  onPress,
}) => {
  const colorScheme = useColorScheme() ?? "light";
  const toneStyle = colorScheme === "dark" ? styles.cardDark : styles.cardLight;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        toneStyle,
        pressed ? styles.cardPressed : null,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={accessibilityHint}
    >
      <Image source={image} style={styles.thumbnail} resizeMode="cover" />
      <View style={styles.content}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText style={styles.description}>{description}</ThemedText>
        <ThemedText style={styles.cta}>{cta}</ThemedText>
      </View>
    </Pressable>
  );
};

export default ExerciseCard;
