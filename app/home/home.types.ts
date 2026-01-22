import { Href } from "expo-router";

export type HomeActionKey =
  | "routine"
  | "exercises"
  | "sessions"
  | "settings"
  | "aiCoach";

export interface HomeNavAction {
  href: Href;
  key: HomeActionKey;
  icon: string;
  color: string;
}
