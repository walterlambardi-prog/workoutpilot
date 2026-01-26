import React from "react";
import { H1, H2, H3, H4, Paragraph, TextProps } from "tamagui";

export interface TTextProps extends TextProps {
  variant?: "body" | "caption" | "label";
}

export interface THeadingProps extends TextProps {
  level?: 1 | 2 | 3 | 4;
}

/**
 * Custom Text component built with Tamagui
 *
 * @example
 * ```tsx
 * <TText>Default body text</TText>
 * <TText variant="caption">Small caption text</TText>
 * <TText variant="label" fontWeight="600">Label text</TText>
 * ```
 */
export const TText: React.FC<TTextProps> = ({
  variant = "body",
  children,
  ...props
}) => {
  if (variant === "caption") {
    return (
      <Paragraph
        fontSize="$2"
        lineHeight="$2"
        {...{ color: "$placeholderColor" as any }}
        {...props}
      >
        {children}
      </Paragraph>
    );
  }

  if (variant === "label") {
    return (
      <Paragraph
        fontSize="$3"
        lineHeight="$3"
        fontWeight="600"
        {...{ color: "$color" as any }}
        {...props}
      >
        {children}
      </Paragraph>
    );
  }

  return (
    <Paragraph
      fontSize="$4"
      lineHeight="$4"
      {...{ color: "$color" as any }}
      {...props}
    >
      {children}
    </Paragraph>
  );
};

/**
 * Custom Heading component built with Tamagui
 *
 * @example
 * ```tsx
 * <THeading level={1}>Main Title</THeading>
 * <THeading level={2}>Section Title</THeading>
 * <THeading level={3}>Subsection</THeading>
 * ```
 */
export const THeading: React.FC<THeadingProps> = ({
  level = 2,
  children,
  ...props
}) => {
  const components = {
    1: H1,
    2: H2,
    3: H3,
    4: H4,
  };

  const Component = components[level];

  return (
    <Component color="$color" fontWeight="700" {...props}>
      {children}
    </Component>
  );
};

export default TText;
