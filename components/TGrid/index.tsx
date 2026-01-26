import React from "react";
import { XStack, YStack, useMedia } from "tamagui";

export interface TGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  gap?: "$1" | "$2" | "$3" | "$4" | "$5" | "$6";
  /** @deprecated Use `gap` instead. */
  space?: "$1" | "$2" | "$3" | "$4" | "$5" | "$6";
}

/**
 * Responsive grid component that adapts to screen size
 * On web with enough space, shows 2 columns
 * On mobile or narrow screens, shows 1 column
 *
 * @example
 * ```tsx
 * <TGrid columns={2} gap="$3">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </TGrid>
 * ```
 */
export const TGrid: React.FC<TGridProps> = ({
  children,
  columns = 1,
  gap,
  space,
}) => {
  const media = useMedia();
  const resolvedGap = gap ?? space ?? "$3";

  // Use 2 columns on medium+ screens if requested, otherwise single column
  const shouldUseColumns = columns === 2 && (media.gtSm || media.gtMd);

  if (!shouldUseColumns) {
    // Single column layout
    return (
      <YStack
        gap={resolvedGap}
        width="100%"
        minWidth={0}
        paddingBottom={resolvedGap}
      >
        {children}
      </YStack>
    );
  }

  // Two column layout - split children into pairs
  const items = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];

  for (let i = 0; i < items.length; i += 2) {
    rows.push([items[i], items[i + 1]].filter(Boolean));
  }

  return (
    <YStack
      gap={resolvedGap}
      width="100%"
      minWidth={0}
      paddingBottom={resolvedGap}
    >
      {rows.map((row, rowIndex) => (
        <XStack key={rowIndex} gap={resolvedGap} width="100%" minWidth={0}>
          {row.map((item, itemIndex) => (
            <YStack key={itemIndex} flex={1} width="100%" minWidth={0}>
              {item}
            </YStack>
          ))}
          {/* Keep grid gutter when the last row has an odd item */}
          {row.length === 1 && columns === 2 && (
            <YStack flex={1} width="100%" minWidth={0} aria-hidden />
          )}
        </XStack>
      ))}
    </YStack>
  );
};

export default TGrid;
