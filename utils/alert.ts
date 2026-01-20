import { Alert, Platform } from "react-native";

export interface AlertButton {
  text: string;
  onPress?: () => void;
  style?: "default" | "cancel" | "destructive";
}

/**
 * Cross-platform alert utility
 * Uses native Alert on mobile and window.confirm/alert on web
 */
export const showAlert = (
  title: string,
  message?: string,
  buttons?: AlertButton[],
): void => {
  if (Platform.OS === "web") {
    // Web implementation
    if (!buttons || buttons.length === 0) {
      window.alert(`${title}\n\n${message || ""}`);
      return;
    }

    if (buttons.length === 1) {
      window.alert(`${title}\n\n${message || ""}`);
      buttons[0].onPress?.();
      return;
    }

    // For confirm dialogs (2 buttons)
    const confirmMessage = `${title}\n\n${message || ""}`;
    const confirmed = window.confirm(confirmMessage);

    if (confirmed) {
      // Find the non-cancel button
      const confirmButton = buttons.find((btn) => btn.style !== "cancel");
      confirmButton?.onPress?.();
    } else {
      // Find the cancel button
      const cancelButton = buttons.find((btn) => btn.style === "cancel");
      cancelButton?.onPress?.();
    }
  } else {
    // Native implementation
    Alert.alert(title, message, buttons as any);
  }
};
