import { styled } from "tamagui";

import { TCard } from "@/components/TCard";
import { TRow, TStack } from "@/components/TStack";

export const HeroCard = styled(TCard, {
  gap: "$3",
  padding: "$5",
  backgroundColor: "$backgroundHover",
  borderColor: "$borderColorHover",
});

export const HighlightRow = styled(TRow, {
  gap: "$2",
  flexWrap: "wrap",
  alignItems: "center",
});

export const StatCard = styled(TCard, {
  gap: "$2",
  padding: "$4",
  backgroundColor: "$background",
  borderColor: "$borderColor",
});

export const ActionsRow = styled(TRow, {
  gap: "$3",
  flexWrap: "wrap",
});

export const SummaryCard = styled(TCard, {
  gap: "$3",
  padding: "$4",
  borderColor: "$borderColor",
});

export const RoundsStack = styled(TStack, {
  gap: "$3",
});

export const RoundCard = styled(TCard, {
  gap: "$3",
  padding: "$4",
  backgroundColor: "$backgroundHover",
  borderColor: "$borderColorHover",
});

export const RoundHeader = styled(TRow, {
  gap: "$3",
  alignItems: "center",
  justifyContent: "space-between",
  flexWrap: "wrap",
});

export const RoundMetaRow = styled(TRow, {
  gap: "$2",
  flexWrap: "wrap",
  alignItems: "center",
});

export const StepsStack = styled(TStack, {
  gap: "$2",
});

export const StepRow = styled(TRow, {
  gap: "$2",
  justifyContent: "space-between",
  alignItems: "flex-start",
  paddingVertical: "$3",
  borderBottomWidth: 1,
  borderBottomColor: "$borderColor",
});

export const StepRowLast = styled(StepRow, {
  borderBottomWidth: 0,
});
