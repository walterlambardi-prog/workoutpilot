import { TagTone } from "./TTag.types";

type TagStyle = {
  backgroundColor: string;
  borderColor: string;
  color: string;
};

export const TAG_BASE_STYLES = {
  alignItems: "center",
  gap: "$2",
  paddingHorizontal: "$3",
  paddingVertical: "$2",
  borderRadius: "$5",
  flexShrink: 0,
  borderWidth: 1,
} as const;

export const TAG_VARIANTS: Record<TagTone, TagStyle> = {
  primary: {
    backgroundColor: "$primary",
    borderColor: "$primary",
    color: "$onPrimary",
  },
  neutral: {
    backgroundColor: "$backgroundHover",
    borderColor: "$borderColor",
    color: "$color",
  },
};
