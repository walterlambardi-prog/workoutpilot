import { Image } from "expo-image";
import { Link } from "expo-router";
import React from "react";
import { Platform, Pressable } from "react-native";

import { HelloWave } from "@/components/hello-wave";
import ParallaxScrollView from "@/components/parallax-scroll-view";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import styles from "./home.styles";
import { HomeNavAction } from "./home.types";

const actions: HomeNavAction[] = [
  {
    href: "/explore",
    title: "Explorar",
    description: "Revisa la guía del proyecto y cómo navegarlo.",
    accessibilityHint: "Abre la pantalla de guía y documentación interna",
  },
  {
    href: "/exercises",
    title: "Ejercicios",
    description: "Prueba la demo de pose: nativa en móvil y web en navegador.",
    accessibilityHint: "Abre la pantalla de ejercicios con detección de pose",
  },
];

/**
 * Home screen for WorkoutPilot
 * Acts as an entry point to Explore and Exercises
 */
const HomeScreen: React.FC = () => {
  return (
    <ParallaxScrollView
      headerBackgroundColor={{ light: "#A1CEDC", dark: "#1D3D47" }}
      headerImage={
        <Image
          source={require("@/assets/images/partial-react-logo.png")}
          style={styles.reactLogo}
        />
      }
    >
      <ThemedView style={styles.titleContainer}>
        <ThemedText type="title">WorkoutPilot</ThemedText>
        <HelloWave />
      </ThemedView>

      <ThemedView style={styles.heroContainer}>
        <ThemedText type="subtitle">Tu hub inicial</ThemedText>
        <ThemedText>
          Arranca aquí y salta directo a las vistas clave de la app. Usa los
          accesos rápidos para explorar y probar la demo de pose.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.actionsContainer}>
        {actions.map((action) => (
          <Link key={action.title} href={action.href} asChild>
            <Pressable
              style={({ pressed }) => [
                styles.actionCard,
                pressed ? styles.actionCardPressed : null,
              ]}
              accessibilityRole="button"
              accessibilityLabel={action.title}
              accessibilityHint={action.accessibilityHint}
            >
              <ThemedText type="subtitle">{action.title}</ThemedText>
              <ThemedText>{action.description}</ThemedText>
            </Pressable>
          </Link>
        ))}
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">Atajos para desarrollo</ThemedText>
        <ThemedText>
          Edita las rutas en app/index.tsx, app/explore/index.tsx y
          app/exercises/index.tsx. Ajusta la navegación en app/_layout.tsx.
        </ThemedText>
        <ThemedText>
          Abre las devtools con{" "}
          {Platform.select({ ios: "cmd + d", android: "cmd + m", web: "F12" })}.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.stepContainer}>
        <ThemedText type="subtitle">¿Necesitas un reset?</ThemedText>
        <ThemedText>
          Ejecuta npm run reset-project para regenerar la carpeta app con el
          template base.
        </ThemedText>
      </ThemedView>
    </ParallaxScrollView>
  );
};

export default HomeScreen;
