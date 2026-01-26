import { ButtonProps } from "tamagui";

import type { TButtonVariant } from "./TButton.types";

type VariantStyles = Record<
  TButtonVariant,
  {
    backgroundColor: ButtonProps["backgroundColor"];
    color: ButtonProps["color"];
    hoverStyle: ButtonProps["hoverStyle"];
    pressStyle: ButtonProps["pressStyle"];
    borderColor?: ButtonProps["borderColor"];
  }
>;

export const BUTTON_ICON_SIZE = 20;

export const VARIANT_STYLES: VariantStyles = {
  primary: {
    backgroundColor: "$primary",
    // Use theme text color for better contrast across themes
    color: "$color",
    hoverStyle: { backgroundColor: "$primary", opacity: 0.9 },
    pressStyle: { backgroundColor: "$primary", opacity: 0.8 },
  },
  secondary: {
    backgroundColor: "$backgroundHover",
    color: "$color",
    hoverStyle: { backgroundColor: "$backgroundPress" },
    pressStyle: { backgroundColor: "$backgroundPress", opacity: 0.8 },
  },
  outline: {
    backgroundColor: "transparent",
    borderColor: "$borderColor",
    color: "$color",
    hoverStyle: { backgroundColor: "$backgroundHover" },
    pressStyle: { backgroundColor: "$backgroundPress" },
  },
  ghost: {
    backgroundColor: "transparent",
    color: "$color",
    hoverStyle: { backgroundColor: "$backgroundHover" },
    pressStyle: { backgroundColor: "$backgroundPress" },
  },
};
