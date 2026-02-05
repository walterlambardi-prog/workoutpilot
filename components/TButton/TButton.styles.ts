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
    color: "$onPrimary" as ButtonProps["color"],
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
    borderColor: "$primary",
    color: "$primary",
    hoverStyle: {
      backgroundColor: "$backgroundHover",
      borderColor: "$primary",
    },
    pressStyle: {
      backgroundColor: "$backgroundPress",
      borderColor: "$primary",
    },
  },
  ghost: {
    backgroundColor: "transparent",
    color: "$color",
    hoverStyle: { backgroundColor: "$backgroundHover" },
    pressStyle: { backgroundColor: "$backgroundPress" },
  },
  destructive: {
    backgroundColor: "$error",
    color: "#ffffff" as ButtonProps["color"],
    hoverStyle: { backgroundColor: "$error", opacity: 0.9 },
    pressStyle: { backgroundColor: "$error", opacity: 0.8 },
  },
  success: {
    backgroundColor: "$success",
    color: "#ffffff" as ButtonProps["color"],
    hoverStyle: { backgroundColor: "$success", opacity: 0.9 },
    pressStyle: { backgroundColor: "$success", opacity: 0.8 },
  },
  warning: {
    backgroundColor: "$warning",
    color: "#ffffff" as ButtonProps["color"],
    hoverStyle: { backgroundColor: "$warning", opacity: 0.9 },
    pressStyle: { backgroundColor: "$warning", opacity: 0.8 },
  },
  info: {
    backgroundColor: "$info",
    color: "#ffffff" as ButtonProps["color"],
    hoverStyle: { backgroundColor: "$info", opacity: 0.9 },
    pressStyle: { backgroundColor: "$info", opacity: 0.8 },
  },
};
