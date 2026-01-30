import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ButtonText,
  Spinner,
  Button as TamaguiButton,
  XStack,
  useTheme,
  type ButtonProps,
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
  textColor,
  isLoading = false,
  children,
  disabled,
  iconOnly = false,
  size,
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

  const resolvedTextColor = (textColor ??
    palette.color) as ButtonProps["color"];
  const resolvedIconColor = (iconColor ??
    resolveTokenColor(resolvedTextColor)) as string | undefined;

  const buttonSize = size ?? "$5";
  const contentGap = iconOnly ? 0 : "$2";

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
      size={buttonSize}
      fontWeight="700"
      borderRadius="$4"
      circular={iconOnly ? true : props.circular}
      backgroundColor={palette.backgroundColor}
      color={resolvedTextColor}
      hoverStyle={palette.hoverStyle}
      pressStyle={palette.pressStyle}
      borderColor={palette.borderColor}
      borderWidth={palette.borderColor ? 1 : undefined}
      width={fullWidth ? "100%" : undefined}
      disabled={disabled || isLoading}
      {...props}
    >
      <XStack gap={contentGap} alignItems="center" justifyContent="center">
        {isLoading && <Spinner size="small" color={resolvedIconColor} />}
        {leadingIcon}
        {!iconOnly && (
          <ButtonText color={resolvedTextColor} fontWeight="700">
            {children}
          </ButtonText>
        )}
        {!iconOnly && trailingIcon}
        {iconOnly && trailingIcon}
      </XStack>
    </TamaguiButton>
  );
};

export default TButton;
