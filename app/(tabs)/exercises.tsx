import React, { useState } from "react";
import {
    Dimensions,
    Platform,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

// Lazy load web version if on web
if (Platform.OS === "web") {
  const ExercisesWebModule = require("./exercises.web");
  const ExercisesWebScreen = ExercisesWebModule.default;
  module.exports = { default: ExercisesWebScreen };
} else {
  // Native imports only loaded on native platforms
  const {
    RNMediapipe,
    switchCamera,
  } = require("@thinksys/react-native-mediapipe");

  const { width } = Dimensions.get("window");
  const CAMERA_WIDTH = width - 32;
  const CAMERA_HEIGHT = (CAMERA_WIDTH * 4) / 3;

  type Status = "idle" | "detecting" | "error";

  function ExercisesNativeScreen() {
    const [status, setStatus] = useState<Status>("idle");
    const [message, setMessage] = useState("Cámara iniciada");
    const [poseCount, setPoseCount] = useState(0);

    const handleLandmark = (data: any) => {
      try {
        if (data && data.length > 0) {
          setStatus("detecting");
          setPoseCount(1);
          setMessage("Pose detectada");
        } else {
          setPoseCount(0);
          setMessage("Sin pose detectada");
        }
      } catch (error) {
        setStatus("error");
        setMessage("Error procesando landmarks");
        console.error("Error processing landmarks:", error);
      }
    };

    const handleSwitchCamera = () => {
      try {
        switchCamera();
        setMessage("Cámara cambiada");
      } catch (error) {
        setStatus("error");
        setMessage("Error al cambiar cámara");
        console.error("Error switching camera:", error);
      }
    };

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Exercises (Native)</Text>
          <Text style={styles.subtitle}>
            Demo con @thinksys/react-native-mediapipe
          </Text>
        </View>

        <View style={styles.cameraContainer}>
          <RNMediapipe
            width={CAMERA_WIDTH}
            height={CAMERA_HEIGHT}
            onLandmark={handleLandmark}
            face={true}
            leftArm={true}
            rightArm={true}
            leftWrist={true}
            rightWrist={true}
            torso={true}
            leftLeg={true}
            rightLeg={true}
            leftAnkle={true}
            rightAnkle={true}
          />
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            onPress={handleSwitchCamera}
            style={styles.button}
            activeOpacity={0.8}
          >
            <Text style={styles.buttonText}>Cambiar Cámara</Text>
          </TouchableOpacity>

          <View style={styles.statsContainer}>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Status:</Text>
              <Text style={styles.statValue}>{status}</Text>
            </View>
            <View style={styles.statRow}>
              <Text style={styles.statLabel}>Poses:</Text>
              <Text style={styles.statValue}>{poseCount}</Text>
            </View>
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            • Detección en tiempo real con MediaPipe
          </Text>
          <Text style={styles.footerText}>
            • Muestra 33 puntos de referencia del cuerpo
          </Text>
          <Text style={styles.footerText}>
            • Callback onLandmark para procesar datos
          </Text>
        </View>
      </View>
    );
  }

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: "#0f172a",
    },
    header: {
      paddingTop: 60,
      paddingHorizontal: 16,
      paddingBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: "bold",
      color: "#f8fafc",
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: "#cbd5e1",
    },
    cameraContainer: {
      alignItems: "center",
      marginVertical: 16,
      borderRadius: 12,
      overflow: "hidden",
      marginHorizontal: 16,
    },
    controls: {
      paddingHorizontal: 16,
      gap: 16,
    },
    button: {
      backgroundColor: "#38bdf8",
      paddingVertical: 14,
      paddingHorizontal: 24,
      borderRadius: 10,
      alignItems: "center",
    },
    buttonText: {
      color: "#0b1220",
      fontSize: 16,
      fontWeight: "700",
    },
    statsContainer: {
      backgroundColor: "#0b1220",
      borderRadius: 12,
      padding: 16,
      borderWidth: 1,
      borderColor: "#1f2937",
      gap: 8,
    },
    statRow: {
      flexDirection: "row",
      gap: 8,
    },
    statLabel: {
      fontSize: 14,
      color: "#cbd5e1",
      fontWeight: "600",
    },
    statValue: {
      fontSize: 14,
      color: "#e2e8f0",
    },
    message: {
      fontSize: 14,
      color: "#e2e8f0",
      marginTop: 4,
    },
    footer: {
      marginTop: 16,
      paddingHorizontal: 16,
      gap: 4,
    },
    footerText: {
      fontSize: 12,
      color: "#94a3b8",
    },
  });

  module.exports = { default: ExercisesNativeScreen };
}
