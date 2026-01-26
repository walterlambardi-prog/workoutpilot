import React from "react";
import { View } from "react-native";

import { ThemedText } from "@/components/ThemedText";

import styles from "./ScreenHeader.styles";
import type { ScreenHeaderProps } from "./ScreenHeader.types";

/**
 * ScreenHeader component for consistent page headers across the app
 * Displays title and optional subtitle with standardized styling
 */
const ScreenHeader: React.FC<ScreenHeaderProps> = ({ title, subtitle }) => {
  return (
    <View style={styles.container}>
      <ThemedText style={styles.title} type="title">
        {title}
      </ThemedText>
      {subtitle && <ThemedText style={styles.subtitle}>{subtitle}</ThemedText>}
    </View>
  );
};

export default ScreenHeader;
