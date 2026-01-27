import React from "react";
import { XStack, YStack, useMedia } from "tamagui";

import type { TGridProps } from "./TGrid.types";
export type { TGridProps } from "./TGrid.types";

/**
 * Responsive grid component that adapts to screen size.
 * Requests up to 3 columns and gracefully falls back to 2 then 1 based on space.
 *
 * @example
 * ```tsx
 * <TGrid columns={3} gap="$3">
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

  const requestedColumns = columns ?? 1;
  const isLarge = media.gtMd || media.gtLg;
  const isMedium = media.gtSm || isLarge;

  let resolvedColumns: 1 | 2 | 3 = 1;

  if (requestedColumns >= 3 && isLarge) {
    resolvedColumns = 3;
  } else if (requestedColumns >= 2 && isMedium) {
    resolvedColumns = 2;
  }

  if (resolvedColumns === 1) {
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

  const items = React.Children.toArray(children);
  const rows: React.ReactNode[][] = [];

  for (let i = 0; i < items.length; i += resolvedColumns) {
    rows.push(items.slice(i, i + resolvedColumns));
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
          {row.length < resolvedColumns &&
            Array.from({ length: resolvedColumns - row.length }).map(
              (_, fillerIndex) => (
                <YStack
                  key={`filler-${rowIndex}-${fillerIndex}`}
                  flex={1}
                  width="100%"
                  minWidth={0}
                  aria-hidden
                />
              ),
            )}
        </XStack>
      ))}
    </YStack>
  );
};

export default TGrid;
