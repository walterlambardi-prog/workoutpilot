import { Image } from "expo-image";
import React from "react";
import { Platform } from "react-native";

import { ExternalLink } from "@/components/external-link";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Collapsible } from "@/components/ui/collapsible";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Fonts } from "@/constants/theme";
import styles from "./explore.styles";
import { ExploreInfoItem } from "./explore.types";

const infoItems: ExploreInfoItem[] = [
  {
    title: "Ruteo por archivos",
    content: (
      <>
        <ThemedText>
          La app usa rutas en app/: home vive en app/index.tsx, explore en
          app/explore/index.tsx y exercises en app/exercises/index.tsx.
        </ThemedText>
        <ThemedText>
          Ajusta la navegación en app/_layout.tsx usando un Stack.
        </ThemedText>
      </>
    ),
  },
  {
    title: "Soporte multiplataforma",
    content: (
      <>
        <ThemedText>
          Abre el proyecto en Android, iOS y web. Presiona
          <ThemedText type="defaultSemiBold"> w </ThemedText> en la terminal
          para levantar la versión web.
        </ThemedText>
        <ThemedText>
          Exercises usa un componente nativo y otro web según la plataforma.
        </ThemedText>
      </>
    ),
  },
  {
    title: "Imágenes",
    content: (
      <>
        <ThemedText>
          Usa sufijos @2x y @3x para activos estáticos y asegurar buena
          resolución.
        </ThemedText>
        <Image
          source={require("@/assets/images/react-logo.png")}
          style={{ width: 100, height: 100, alignSelf: "center" }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Más info</ThemedText>
        </ExternalLink>
      </>
    ),
  },
  {
    title: "Theming claro/oscuro",
    content: (
      <>
        <ThemedText>
          Usa el hook useColorScheme() para adaptar colores. Los componentes
          ThemedText y ThemedView ya responden al tema.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Ver guía</ThemedText>
        </ExternalLink>
      </>
    ),
  },
  {
    title: "Animaciones",
    content: (
      <>
        <ThemedText>
          HelloWave usa react-native-reanimated para un gesto simple.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              ParallaxScrollView aplica efecto parallax en iOS.
            </ThemedText>
          ),
        })}
      </>
    ),
  },
];

const ExploreScreen: React.FC = () => {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#D0D0D0", dark: "#353636" }}
      headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}
        >
          Explore
        </ThemedText>
      </ThemedView>

      {infoItems.map((item) => (
        <Collapsible key={item.title} title={item.title}>
          {item.content}
        </Collapsible>
      ))}
    </ParallaxScrollView>
  );
};

export default ExploreScreen;
