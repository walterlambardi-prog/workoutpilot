import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
    ButtonText,
    Spinner,
    Button as TamaguiButton,
    XStack,
    useTheme,
} from "tamagui";

import { BUTTON_ICON_SIZE, VARIANT_STYLES } from "./TButton.styles";
import type { TButtonProps } from "./TButton.types";

/**
 * Tamagui-based reusable button with optional icons and loading state.
 */
export const TButton: React.FC<TButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  iconName,
  iconAfterName,
  iconColor,
  isLoading = false,
  children,
  disabled,
  ...props
}) => {
  const theme = useTheme();
  const palette = VARIANT_STYLES[variant];

  const resolveTokenColor = (
    token: TButtonProps["color"] | undefined,
  ): string | undefined => {
    if (!token || typeof token !== "string") return token as string | undefined;
    const key = token.replace("$", "");
    const value = (theme as Record<string, unknown>)[key];
    if (value && typeof value === "object" && "val" in (value as object)) {
      return (value as { val?: string }).val ?? token;
    }
    if (typeof value === "string") return value;
    return token;
  };

  const resolvedIconColor = iconColor ?? resolveTokenColor(palette.color);
  const resolvedTextColor = palette.color;

  const leadingIcon = iconName ? (
    <Ionicons
      name={iconName}
      size={BUTTON_ICON_SIZE}
      color={resolvedIconColor}
    />
  ) : undefined;

  const trailingIcon = iconAfterName ? (
    <Ionicons
      name={iconAfterName}
      size={BUTTON_ICON_SIZE}
      color={resolvedIconColor}
    />
  ) : undefined;

  return (
    <TamaguiButton
      size="$5"
      fontWeight="700"
      borderRadius="$4"
      backgroundColor={palette.backgroundColor}
      color={resolvedTextColor}
      hoverStyle={palette.hoverStyle}
      pressStyle={palette.pressStyle}
      borderColor={palette.borderColor}
      borderWidth={palette.borderColor ? 1 : undefined}
      width={fullWidth ? "100%" : undefined}
      icon={leadingIcon}
      iconAfter={trailingIcon}
      disabled={disabled || isLoading}
      {...props}
    >
      <XStack gap="$2" alignItems="center" justifyContent="center">
        {isLoading && <Spinner size="small" color={resolvedIconColor} />}
        <ButtonText color={resolvedTextColor} fontWeight="700">
          {children}
        </ButtonText>
      </XStack>
    </TamaguiButton>
  );
};

export default TButton;
