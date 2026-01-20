import { Href } from "expo-router";

export type HomeActionKey = "exercises" | "sessions" | "settings";

export interface HomeNavAction {
  href: Href;
  key: HomeActionKey;
}
