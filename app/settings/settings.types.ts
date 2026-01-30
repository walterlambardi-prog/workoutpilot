import { Ionicons } from "@expo/vector-icons";

export type SettingsActionTone = "neutral" | "danger";

export interface SettingsAction {
  key: string;
  title: string;
  description: string;
  iconName: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  tone?: SettingsActionTone;
}
