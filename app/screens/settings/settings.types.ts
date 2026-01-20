export interface SettingsAction {
  key: string;
  onPress: () => void;
  destructive?: boolean;
}
