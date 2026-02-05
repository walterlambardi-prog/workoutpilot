import React from "react";
import { ActivityIndicator, View } from "react-native";
import { useTheme } from "tamagui";

import { styles } from "./AppLoader.styles";
import type { AppLoaderProps } from "./AppLoader.types";

/**
 * AppLoader component displays a loading indicator while the app initializes
 * @param colorScheme - The color scheme to use for the loader (light or dark)
 * @returns A centered loading spinner with theme-appropriate styling
 */
const AppLoader: React.FC<AppLoaderProps> = React.memo(
  ({ colorScheme = "light" }) => {
    const isDark = colorScheme === "dark";
    const theme = useTheme();

    return (
      <View
        style={[
          styles.container,
          isDark ? styles.containerDark : styles.containerLight,
        ]}
      >
        <ActivityIndicator
          size="large"
          color={theme.color?.get() as string}
          testID="app-loader"
        />
      </View>
    );
  },
);

AppLoader.displayName = "AppLoader";

export default AppLoader;
