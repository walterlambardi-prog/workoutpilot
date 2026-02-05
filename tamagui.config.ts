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
    // Text colors
    lightText: Colors.light.text,
    darkText: Colors.dark.text,

    // Background colors
    lightBackground: Colors.light.background,
    darkBackground: Colors.dark.background,
    lightBackgroundHover: "#f5f5f5",
    darkBackgroundHover: "#1f2937",
    lightBackgroundPress: "#e5e5e5",
    darkBackgroundPress: "#374151",
    lightBackgroundStrong: "#000",
    darkBackgroundStrong: "#fff",

    // Border colors
    lightBorder: "#e5e5e5",
    darkBorder: "#374151",
    lightBorderHover: "#d4d4d4",
    darkBorderHover: "#4b5563",
    lightBorderPress: "#a3a3a3",
    darkBorderPress: "#6b7280",

    // Placeholder colors
    lightPlaceholder: "#a3a3a3",
    darkPlaceholder: "#6b7280",

    // Primary/Tint colors
    lightTint: Colors.light.tint,
    darkTint: Colors.dark.tint,
    lightOnPrimary: "#ffffff",
    darkOnPrimary: "#0f172a",

    // Icon colors
    lightIcon: Colors.light.icon,
    darkIcon: Colors.dark.icon,
    lightTabIconDefault: Colors.light.tabIconDefault,
    darkTabIconDefault: Colors.dark.tabIconDefault,
    lightTabIconSelected: Colors.light.tabIconSelected,
    darkTabIconSelected: Colors.dark.tabIconSelected,

    // Semantic colors - Light mode (saturated for light backgrounds)
    successLight: "#16a34a", // green-600
    errorLight: "#dc2626", // red-600
    warningLight: "#ea580c", // orange-600
    infoLight: "#2563eb", // blue-600

    // Semantic colors - Dark mode (brighter for dark backgrounds)
    successDark: "#22c55e", // green-500
    errorDark: "#ef4444", // red-500
    warningDark: "#f59e0b", // amber-500
    infoDark: "#3b82f6", // blue-500

    // Transparent colors
    transparent: "rgba(0,0,0,0)",
    whiteTransparent: "rgba(255,255,255,0)",

    // Overlay colors (semi-transparent backgrounds)
    overlayLight: "rgba(0,0,0,0.45)", // Dark overlay on light content
    overlayDark: "rgba(0,0,0,0.6)", // Darker overlay on dark content (more contrast needed)

    // Stats card colors - Blue (Light mode)
    blue3Light: "#dbeafe", // blue-100
    blue11Light: "#2563eb", // blue-600

    // Stats card colors - Blue (Dark mode)
    blue3Dark: "#1e3a8a", // blue-800
    blue11Dark: "#93c5fd", // blue-300

    // Stats card colors - Green (Light mode)
    green3Light: "#d1fae5", // green-100
    green11Light: "#059669", // green-600

    // Stats card colors - Green (Dark mode)
    green3Dark: "#065f46", // green-800
    green11Dark: "#6ee7b7", // green-300

    // Stats card colors - Purple (Light mode)
    purple3Light: "#e9d5ff", // purple-200
    purple11Light: "#9333ea", // purple-600

    // Stats card colors - Purple (Dark mode)
    purple3Dark: "#581c87", // purple-900
    purple11Dark: "#c084fc", // purple-400

    // Stats card colors - Orange (Light mode)
    orange3Light: "#fed7aa", // orange-200
    orange11Light: "#ea580c", // orange-600

    // Stats card colors - Orange (Dark mode)
    orange3Dark: "#9a3412", // orange-800
    orange11Dark: "#fdba74", // orange-300

    // Navigation icon colors - Light mode
    iconCyanLight: "#22D3EE", // cyan-400
    iconRedLight: "#F87171", // red-400
    iconBlueLight: "#60A5FA", // blue-400
    iconGreenLight: "#34D399", // green-400
    iconPurpleLight: "#A78BFA", // purple-400

    // Navigation icon colors - Dark mode (same, work well on dark bg)
    iconCyanDark: "#22D3EE", // cyan-400
    iconRedDark: "#F87171", // red-400
    iconBlueDark: "#60A5FA", // blue-400
    iconGreenDark: "#34D399", // green-400
    iconPurpleDark: "#A78BFA", // purple-400

    // Streak calendar colors - Active (both modes)
    streakActive: "#22c55e", // green-500
    streakActiveText: "#ffffff", // white

    // Streak calendar colors - Inactive (Light mode)
    streakInactiveBgLight: "#e5e7eb", // gray-200
    streakInactiveTextLight: "#6b7280", // gray-500

    // Streak calendar colors - Inactive (Dark mode)
    streakInactiveBgDark: "#374151", // gray-700
    streakInactiveTextDark: "#9ca3af", // gray-400
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
  colorTransparent: tokens.color.transparent,

  background: tokens.color.lightBackground,
  backgroundHover: tokens.color.lightBackgroundHover,
  backgroundPress: tokens.color.lightBackgroundPress,
  backgroundFocus: tokens.color.lightBackgroundHover,
  backgroundStrong: tokens.color.lightBackgroundStrong,
  backgroundTransparent: tokens.color.whiteTransparent,

  borderColor: tokens.color.lightBorder,
  borderColorHover: tokens.color.lightBorderHover,
  borderColorPress: tokens.color.lightBorderPress,
  borderColorFocus: tokens.color.lightTint,

  placeholderColor: tokens.color.lightPlaceholder,

  // Semantic colors - Light mode (saturated for better contrast)
  primary: tokens.color.lightTint,
  onPrimary: tokens.color.lightOnPrimary,
  success: tokens.color.successLight,
  error: tokens.color.errorLight,
  warning: tokens.color.warningLight,
  info: tokens.color.infoLight,

  // Stats card colors - Light mode
  blue3: tokens.color.blue3Light,
  blue11: tokens.color.blue11Light,
  green3: tokens.color.green3Light,
  green11: tokens.color.green11Light,
  purple3: tokens.color.purple3Light,
  purple11: tokens.color.purple11Light,
  orange3: tokens.color.orange3Light,
  orange11: tokens.color.orange11Light,

  // Navigation icon colors - Light mode
  iconCyan: tokens.color.iconCyanLight,
  iconRed: tokens.color.iconRedLight,
  iconBlue: tokens.color.iconBlueLight,
  iconGreen: tokens.color.iconGreenLight,
  iconPurple: tokens.color.iconPurpleLight,

  // Streak calendar colors
  streakActive: tokens.color.streakActive,
  streakActiveText: tokens.color.streakActiveText,
  streakInactiveBg: tokens.color.streakInactiveBgLight,
  streakInactiveText: tokens.color.streakInactiveTextLight,

  // Overlay
  overlay: tokens.color.overlayLight,
};

// Create dark theme
const darkTheme = {
  color: tokens.color.darkText,
  colorHover: tokens.color.darkText,
  colorPress: tokens.color.darkText,
  colorFocus: tokens.color.darkText,
  colorTransparent: tokens.color.whiteTransparent,

  background: tokens.color.darkBackground,
  backgroundHover: tokens.color.darkBackgroundHover,
  backgroundPress: tokens.color.darkBackgroundPress,
  backgroundFocus: tokens.color.darkBackgroundHover,
  backgroundStrong: tokens.color.darkBackgroundStrong,
  backgroundTransparent: tokens.color.transparent,

  borderColor: tokens.color.darkBorder,
  borderColorHover: tokens.color.darkBorderHover,
  borderColorPress: tokens.color.darkBorderPress,
  borderColorFocus: tokens.color.darkTint,

  placeholderColor: tokens.color.darkPlaceholder,

  // Semantic colors - Dark mode (brighter for better contrast on dark backgrounds)
  primary: tokens.color.darkTint,
  onPrimary: tokens.color.darkOnPrimary,
  success: tokens.color.successDark,
  error: tokens.color.errorDark,
  warning: tokens.color.warningDark,
  info: tokens.color.infoDark,

  // Stats card colors - Dark mode
  blue3: tokens.color.blue3Dark,
  blue11: tokens.color.blue11Dark,
  green3: tokens.color.green3Dark,
  green11: tokens.color.green11Dark,
  purple3: tokens.color.purple3Dark,
  purple11: tokens.color.purple11Dark,
  orange3: tokens.color.orange3Dark,
  orange11: tokens.color.orange11Dark,

  // Navigation icon colors - Dark mode
  iconCyan: tokens.color.iconCyanDark,
  iconRed: tokens.color.iconRedDark,
  iconBlue: tokens.color.iconBlueDark,
  iconGreen: tokens.color.iconGreenDark,
  iconPurple: tokens.color.iconPurpleDark,

  // Streak calendar colors
  streakActive: tokens.color.streakActive,
  streakActiveText: tokens.color.streakActiveText,
  streakInactiveBg: tokens.color.streakInactiveBgDark,
  streakInactiveText: tokens.color.streakInactiveTextDark,

  // Overlay
  overlay: tokens.color.overlayDark,
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
