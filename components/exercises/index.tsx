import { RNMediapipe } from "@thinksys/react-native-mediapipe";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { CAMERA_HEIGHT, CAMERA_WIDTH } from "./exercises.constants";
import styles from "./exercises.styles";
import { usePoseDetection } from "./hooks/usePoseDetection";

/**
 * Native exercises screen with MediaPipe pose detection
 * Uses @thinksys/react-native-mediapipe for iOS/Android
 */
export default function ExercisesNativeScreen() {
  const { status, message, poseCount, handleLandmark, handleSwitchCamera } =
    usePoseDetection();

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
          accessible={true}
          accessibilityLabel="Cambiar cámara"
          accessibilityRole="button"
          accessibilityHint="Cambia entre cámara frontal y trasera"
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
