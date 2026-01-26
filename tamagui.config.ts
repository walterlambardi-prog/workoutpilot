import { config as configDefault } from "@tamagui/config/v3";
import { createTamagui, createTokens } from "tamagui";
import { Colors } from "./constants/theme";

// Define custom tokens based on our existing theme
const tokens = createTokens({
  // Spacing tokens that match our existing Spacing constants
  space: {
    $1: 4, // xxs
    $2: 8, // sm
    $3: 12, // md
    $4: 16, // lg
    $5: 20, // xl
    $6: 24, // xxl
    $7: 32, // xxxl
    $8: 40,
    $9: 48,
    $10: 56,
    $true: 16, // default
  },
  size: {
    $0: 0,
    $1: 20,
    $2: 28,
    $3: 36,
    $4: 44,
    $5: 52,
    $6: 64,
    $7: 74,
    $8: 84,
    $9: 94,
    $10: 104,
    $true: 44,
  },
  // Color tokens - we'll use Tamagui's color system
  color: {
    // Light mode colors
    lightText: Colors.light.text,
    lightBackground: Colors.light.background,
    lightTint: Colors.light.tint,
    lightIcon: Colors.light.icon,
    lightTabIconDefault: Colors.light.tabIconDefault,
    lightTabIconSelected: Colors.light.tabIconSelected,

    // Dark mode colors
    darkText: Colors.dark.text,
    darkBackground: Colors.dark.background,
    darkTint: Colors.dark.tint,
    darkIcon: Colors.dark.icon,
    darkTabIconDefault: Colors.dark.tabIconDefault,
    darkTabIconSelected: Colors.dark.tabIconSelected,

    // Semantic colors
    primary: Colors.light.tint,
    primaryDark: Colors.dark.tint,

    // Exercise/fitness specific colors
    success: "#22c55e",
    error: "#ef4444",
    warning: "#f59e0b",
    info: "#3b82f6",
  },
  radius: {
    $0: 0,
    $1: 4,
    $2: 8,
    $3: 12,
    $4: 16,
    $5: 20,
    $6: 24,
    $true: 12,
  },
  zIndex: {
    $0: 0,
    $1: 100,
    $2: 200,
    $3: 300,
    $4: 400,
    $5: 500,
  },
});

// Create light theme
const lightTheme = {
  color: tokens.color.lightText,
  colorHover: tokens.color.lightText,
  colorPress: tokens.color.lightText,
  colorFocus: tokens.color.lightText,
  colorTransparent: "rgba(0,0,0,0)",

  background: tokens.color.lightBackground,
  backgroundHover: "#f5f5f5",
  backgroundPress: "#e5e5e5",
  backgroundFocus: "#f5f5f5",
  backgroundStrong: "#000",
  backgroundTransparent: "rgba(255,255,255,0)",

  borderColor: "#e5e5e5",
  borderColorHover: "#d4d4d4",
  borderColorPress: "#a3a3a3",
  borderColorFocus: tokens.color.lightTint,

  placeholderColor: "#a3a3a3",

  // Semantic colors
  primary: tokens.color.primary,
  success: tokens.color.success,
  error: tokens.color.error,
  warning: tokens.color.warning,
  info: tokens.color.info,
};

// Create dark theme
const darkTheme = {
  color: tokens.color.darkText,
  colorHover: tokens.color.darkText,
  colorPress: tokens.color.darkText,
  colorFocus: tokens.color.darkText,
  colorTransparent: "rgba(255,255,255,0)",

  background: tokens.color.darkBackground,
  backgroundHover: "#1f2937",
  backgroundPress: "#374151",
  backgroundFocus: "#1f2937",
  backgroundStrong: "#fff",
  backgroundTransparent: "rgba(0,0,0,0)",

  borderColor: "#374151",
  borderColorHover: "#4b5563",
  borderColorPress: "#6b7280",
  borderColorFocus: tokens.color.darkTint,

  placeholderColor: "#6b7280",

  // Semantic colors
  primary: tokens.color.primaryDark,
  success: tokens.color.success,
  error: tokens.color.error,
  warning: tokens.color.warning,
  info: tokens.color.info,
};

// Create Tamagui configuration
const config = createTamagui({
  ...configDefault,
  tokens,
  themes: {
    light: lightTheme,
    dark: darkTheme,
  },
  // Media queries for responsive design
  media: {
    xs: { maxWidth: 660 },
    sm: { maxWidth: 800 },
    md: { maxWidth: 1020 },
    lg: { maxWidth: 1280 },
    xl: { maxWidth: 1420 },
    xxl: { maxWidth: 1600 },
    gtXs: { minWidth: 660 + 1 },
    gtSm: { minWidth: 800 + 1 },
    gtMd: { minWidth: 1020 + 1 },
    gtLg: { minWidth: 1280 + 1 },
    short: { maxHeight: 820 },
    tall: { minHeight: 820 },
    hoverNone: { hover: "none" },
    pointerCoarse: { pointer: "coarse" },
  },
  // Settings for better performance
  settings: {
    allowedStyleValues: "somewhat-strict",
    autocompleteSpecificTokens: "except-special",
  },
});

export type AppConfig = typeof config;

declare module "tamagui" {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config;
