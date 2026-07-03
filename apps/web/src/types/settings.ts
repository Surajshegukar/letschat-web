import { LucideIcon } from "lucide-react";

export type SettingsView = "settings" | "profile" | "account" | "privacy" | "chats" | "notifications";

export interface SettingsOption {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  view?: SettingsView;
}
