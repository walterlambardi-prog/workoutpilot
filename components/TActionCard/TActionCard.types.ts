export interface TActionCardProps {
  title: string;
  description: string;
  icon: string;
  iconColor: string;
  onPress: () => void;
  accessibilityHint?: string;
}
