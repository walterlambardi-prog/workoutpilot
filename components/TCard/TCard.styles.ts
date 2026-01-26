import { CardProps } from "tamagui";

export const CARD_BASE_PROPS: Partial<CardProps> = {
  backgroundColor: "$background",
  borderColor: "$borderColor",
  borderWidth: 1,
  borderRadius: "$4",
  padding: "$4",
  animation: "quick",
};

export const CARD_HOVER_STYLE: CardProps["hoverStyle"] = {
  borderColor: "$borderColorHover",
};

export const CARD_PRESS_STYLE: CardProps["pressStyle"] = {
  scale: 0.98,
};
