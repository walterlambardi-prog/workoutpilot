import React from "react";
import {
    Button as TamaguiButton,
    ButtonProps as TamaguiButtonProps,
} from "tamagui";

import { VARIANT_STYLES } from "./TButton.styles";

export interface TButtonProps extends Omit<TamaguiButtonProps, "variant"> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  fullWidth?: boolean;
}

/**
 * Custom Button component built with Tamagui
 */
export const TButton: React.FC<TButtonProps> = ({
  variant = "primary",
  fullWidth = false,
  children,
  ...props
}) => {
  return (
    <TamaguiButton
      size="$4"
      fontWeight="600"
      borderRadius="$3"
      backgroundColor={VARIANT_STYLES[variant].backgroundColor}
      color={VARIANT_STYLES[variant].color}
      hoverStyle={VARIANT_STYLES[variant].hoverStyle}
      pressStyle={VARIANT_STYLES[variant].pressStyle}
      borderColor={
        variant === "outline" ? VARIANT_STYLES[variant].borderColor : undefined
      }
      borderWidth={variant === "outline" ? 1 : undefined}
      width={fullWidth ? "100%" : undefined}
      {...props}
    >
      {children}
    </TamaguiButton>
  );
};

export default TButton;
