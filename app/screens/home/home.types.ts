import { Href } from "expo-router";

export interface HomeNavAction {
  href: Href;
  title: string;
  description: string;
  accessibilityHint?: string;
}
