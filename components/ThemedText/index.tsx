import { StyleSheet, Text, type TextProps } from "react-native";

import { useThemeColor } from "@/hooks/useThemeColor";

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: "default" | "title" | "defaultSemiBold" | "subtitle" | "link";
  textShadow?: {
    color?: string;
    radius?: number;
    offset?: {
      width?: number;
      height?: number;
    };
  };
};

export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = "default",
  textShadow,
  ...rest
}: ThemedTextProps) {
  const color = useThemeColor({ light: lightColor, dark: darkColor }, "text");
  const linkColor = useThemeColor({}, "tint"); // Use tint color for links

  const shadowStyle = textShadow
    ? {
        textShadowColor: textShadow.color,
        textShadowRadius: textShadow.radius,
        textShadowOffset:
          textShadow.offset &&
          textShadow.offset.width !== undefined &&
          textShadow.offset.height !== undefined
            ? {
                width: textShadow.offset.width,
                height: textShadow.offset.height,
              }
            : undefined,
      }
    : undefined;

  return (
    <Text
      style={[
        { color: type === "link" ? linkColor : color },
        shadowStyle,
        type === "default" ? styles.default : undefined,
        type === "title" ? styles.title : undefined,
        type === "defaultSemiBold" ? styles.defaultSemiBold : undefined,
        type === "subtitle" ? styles.subtitle : undefined,
        type === "link" ? styles.link : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "600",
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
    // color removed - use $primary or $info token in component
  },
});
