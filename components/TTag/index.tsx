import { Ionicons } from "@expo/vector-icons";
import React, { memo } from "react";
import { GetThemeValueForKey, XStack, useTheme } from "tamagui";

import { TText } from "@/components/TText";

import { TAG_BASE_STYLES, TAG_VARIANTS } from "./TTag.styles";
import { TTagProps } from "./TTag.types";

type ThemeRecord = Record<string, { val?: string } | undefined>;

const resolveTokenValue = (token: string | undefined, theme: ThemeRecord) => {
  if (!token) return undefined;
  if (token.startsWith("$")) {
    const themeKey = token.slice(1);
    const resolved = theme[themeKey];
    if (resolved && typeof resolved === "object" && "val" in resolved) {
      return resolved.val;
    }
  }
  return token;
};

const TTagComponent: React.FC<TTagProps> = memo(
  ({
    label,
    iconName,
    tone = "primary",
    iconSize = 18,
    accessibilityLabel,
    ...rest
  }) => {
    const theme = useTheme();
    const variant = TAG_VARIANTS[tone];

    const backgroundColor =
      variant.backgroundColor as GetThemeValueForKey<"backgroundColor">;
    const borderColor =
      variant.borderColor as GetThemeValueForKey<"borderColor">;
    const textColor = variant.color as GetThemeValueForKey<"color">;
    const resolvedTextColor =
      resolveTokenValue(variant.color, theme as ThemeRecord) || variant.color;

    return (
      <XStack
        {...TAG_BASE_STYLES}
        backgroundColor={backgroundColor}
        borderColor={borderColor}
        accessibilityRole="text"
        accessibilityLabel={accessibilityLabel ?? label}
        {...rest}
      >
        {iconName ? (
          <Ionicons
            name={iconName}
            size={iconSize}
            color={resolvedTextColor}
            accessibilityElementsHidden
          />
        ) : null}
        <TText variant="label" fontWeight="700" color={textColor}>
          {label}
        </TText>
      </XStack>
    );
  },
);

TTagComponent.displayName = "TTag";

export const TTag = TTagComponent;
