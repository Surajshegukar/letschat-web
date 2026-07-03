import { UserStatus } from "@/types/status";

export const INITIAL_STATUSES: UserStatus[] = [
  {
    id: "s1",
    userId: "olivia",
    userName: "Olivia Rhye",
    userAvatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    hasUnread: true,
    lastUpdated: "Today, 11:30 AM",
    stories: [
      {
        id: "olivia-1",
        type: "text",
        content: "Building the new LetsChat client! What features do you want to see? 💻✨",
        backgroundColor: "from-[#00C9FF] to-[#19E68C]",
        fontFamily: "font-sans",
        timestamp: "Today, 11:28 AM",
      },
      {
        id: "olivia-2",
        type: "image",
        content: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=800",
        caption: "Dashboard mockups finalized! Let's build! 🚀",
        timestamp: "Today, 11:30 AM",
      },
    ],
  },
  {
    id: "s2",
    userId: "lucas",
    userName: "Lucas Garcia",
    userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    hasUnread: true,
    lastUpdated: "Today, 9:36 AM",
    stories: [
      {
        id: "lucas-1",
        type: "image",
        content: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800",
        caption: "Weekend hiking escape. Recharge session! 🏔️☀️",
        timestamp: "Today, 9:36 AM",
      },
    ],
  },
  {
    id: "s3",
    userId: "sophia",
    userName: "Sophia Martinez",
    userAvatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    hasUnread: false,
    lastUpdated: "Yesterday, 6:15 PM",
    stories: [
      {
        id: "sophia-1",
        type: "text",
        content: "Offline today! Getting some summer sun 🌴☀️ catch up tomorrow!",
        backgroundColor: "from-orange-400 to-rose-500",
        fontFamily: "font-sans italic",
        timestamp: "Yesterday, 6:15 PM",
      },
    ],
  },
  {
    id: "s4",
    userId: "emma",
    userName: "Emma Watson",
    userAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    hasUnread: false,
    lastUpdated: "Yesterday, 3:20 PM",
    stories: [
      {
        id: "emma-1",
        type: "image",
        content: "https://images.unsplash.com/photo-1507133750040-4a8f57021571?w=800",
        caption: "Coffee makes everything better ☕✨",
        timestamp: "Yesterday, 1:12 PM",
      },
      {
        id: "emma-2",
        type: "text",
        content: "Sprint planning starts at 2:00 PM today. Don't be late! 📊",
        backgroundColor: "from-zinc-900 via-slate-900 to-black",
        fontFamily: "font-mono",
        timestamp: "Yesterday, 3:20 PM",
      },
    ],
  },
];
