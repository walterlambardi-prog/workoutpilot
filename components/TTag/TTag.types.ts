import { Ionicons } from "@expo/vector-icons";
import { ComponentProps } from "react";
import { StackProps } from "tamagui";

export type TagTone = "primary" | "neutral";

export interface TTagProps extends StackProps {
  label: string;
  iconName?: ComponentProps<typeof Ionicons>["name"];
  tone?: TagTone;
  iconSize?: number;
  accessibilityLabel?: string;
}
