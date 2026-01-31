/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from "react-native";

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const Spacing = {
  /** 4px - Minimal spacing */
  xxs: 4,
  /** 6px - Extra small spacing */
  xs: 6,
  /** 8px - Small spacing */
  sm: 8,
  /** 12px - Medium spacing */
  md: 12,
  /** 16px - Standard spacing (default for most UI elements) */
  lg: 16,
  /** 20px - Large spacing */
  xl: 20,
  /** 24px - Extra large spacing */
  xxl: 24,
  /** 32px - Double extra large spacing */
  xxxl: 32,
} as const;

export const ScreenPadding = {
  /** Horizontal padding for screens */
  horizontal: Spacing.lg,
  /** Vertical padding for screens (top) */
  vertical: Spacing.xxl,
  /** Bottom padding for scrollable content */
  bottom: Spacing.xxxl,
} as const;

export const Layout = {
  /** Maximum content width for web layout (1280px) */
  maxContentWidth: 1280,
} as const;
