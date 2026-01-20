export interface ActionCardProps {
  title: string;
  subtitle: string;
  icon: string;
  iconColor: string;
  accessibilityHint?: string;
  onPress: () => void;
}
