import type { Ionicons } from "@expo/vector-icons";
import type React from "react";
import type { ButtonProps } from "tamagui";

export type TButtonVariant =
  | "primary"
  | "secondary"
  | "outline"
  | "ghost"
  | "destructive"
  | "success"
  | "warning"
  | "info";

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
  /** Custom text color override */
  textColor?: string;
  /** When true, shows a loader and disables the button */
  isLoading?: boolean;
  /** Apply a full width layout */
  fullWidth?: boolean;
  /** Visual variant */
  variant?: TButtonVariant;
  /** Hide text and render an icon-only button */
  iconOnly?: boolean;
  children?: React.ReactNode;
}
