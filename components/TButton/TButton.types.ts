import type { Ionicons } from "@expo/vector-icons";
import type React from "react";
import type { ButtonProps } from "tamagui";

export type TButtonVariant = "primary" | "secondary" | "outline" | "ghost";

export interface TButtonProps extends Omit<
  ButtonProps,
  "icon" | "iconAfter" | "children" | "theme" | "variant"
> {
  /** Ionicons name to render before the label */
  iconName?: keyof typeof Ionicons.glyphMap;
  /** Ionicons name to render after the label */
  iconAfterName?: keyof typeof Ionicons.glyphMap;
  /** Custom icon color override */
  iconColor?: string;
  /** When true, shows a loader and disables the button */
  isLoading?: boolean;
  /** Apply a full width layout */
  fullWidth?: boolean;
  /** Visual variant */
  variant?: TButtonVariant;
  children: React.ReactNode;
}
