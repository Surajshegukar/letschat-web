import { User, Key, Lock, MessageSquare, Bell } from "lucide-react";
import { SettingsOption } from "@/types/settings";

export const AVATAR_PRESETS = [
  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
];

export const SETTINGS_OPTIONS: SettingsOption[] = [
  {
    id: "profile",
    title: "Profile",
    subtitle: "Name, profile picture, status message",
    icon: User,
    view: "profile",
  },
  {
    id: "account",
    title: "Account",
    subtitle: "Security configurations, requested information details",
    icon: Key,
    view: "account",
  },
  {
    id: "privacy",
    title: "Privacy",
    subtitle: "Last seen indicators, disappearing messages, blocked contacts",
    icon: Lock,
    view: "privacy",
  },
  {
    id: "chats",
    title: "Chats",
    subtitle: "App theme customizer, wallpaper details, history",
    icon: MessageSquare,
    view: "chats",
  },
  {
    id: "notifications",
    title: "Notifications",
    subtitle: "Sound preferences, previews and message warnings",
    icon: Bell,
    view: "notifications",
  },
];
