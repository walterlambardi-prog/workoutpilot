import { Href } from "expo-router";

export type HomeActionKey = "explore" | "exercises";

export interface HomeNavAction {
  href: Href;
  key: HomeActionKey;
}
