import React from "react";
import { XStack, YStack, useMedia } from "tamagui";

export interface TGridProps {
  children: React.ReactNode;
  columns?: 1 | 2;
  space?: "$1" | "$2" | "$3" | "$4" | "$5" | "$6";
}

/**
 * Responsive grid component that adapts to screen size
 * On web with enough space, shows 2 columns
 * On mobile or narrow screens, shows 1 column
 *
 * @example
 * ```tsx
 * <TGrid columns={2} space="$3">
 *   <Card>Item 1</Card>
 *   <Card>Item 2</Card>
 *   <Card>Item 3</Card>
 * </TGrid>
 * ```
 */
export const TGrid: React.FC<TGridProps> = ({
  children,
  columns = 1,
  space = "$3",
}) => {
  const media = useMedia();

  // Use 2 columns on medium+ screens if requested, otherwise single column
  const shouldUseColumns = columns === 2 && (media.gtSm || media.gtMd);

  if (!shouldUseColumns) {
    // Single column layout
    return (
      <YStack space={space} width="100%">
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
    <YStack space={space} width="100%">
      {rows.map((row, rowIndex) => (
        <XStack key={rowIndex} space={space} width="100%">
          {row.map((item, itemIndex) => (
            <YStack key={itemIndex} flex={1} width="100%">
              {item}
            </YStack>
          ))}
          {/* Add empty spacer if odd number of items in last row */}
          {row.length === 1 && columns === 2 && <YStack flex={1} />}
        </XStack>
      ))}
    </YStack>
  );
};

export default TGrid;
