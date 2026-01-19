import { Href } from "expo-router";

export type HomeActionKey = "exercises" | "sessions";

export interface HomeNavAction {
  href: Href;
  key: HomeActionKey;
}
