import { Channel } from "@/types/channels";

export const INITIAL_CHANNELS: Channel[] = [
  {
    id: "letschat-official",
    name: "Let's Chat Official",
    avatar: "https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=150",
    description: "Get official release notes, product updates, and system announcements from the Let's Chat core engineering team.",
    followers: 120530,
    isFollowed: true,
    updates: [
      {
        id: "official-story-1",
        content: "Welcome to the official Let's Chat broadcast channel! Here we will share system alerts, updates, and upcoming product rollouts directly to our community.",
        timestamp: "Today, 10:00 AM",
        reactions: [
          { emoji: "❤️", count: 124 },
          { emoji: "👍", count: 85 },
        ],
      },
      {
        id: "official-story-2",
        content: "Version 1.4.0 is now live! 🚀 Check out our brand new premium glassmorphic sidebar visual layouts, native dark mode support, and the status updates tab. React below with your thoughts!",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800",
        timestamp: "Today, 11:28 AM",
        reactions: [
          { emoji: "🔥", count: 342 },
          { emoji: "❤️", count: 180 },
          { emoji: "👍", count: 95 },
          { emoji: "😂", count: 14 },
        ],
      },
    ],
  },
  {
    id: "techcrunch",
    name: "TechCrunch",
    avatar: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=150",
    description: "Technology news and analysis with a focus on founders, startup teams, and venture capital rounds.",
    followers: 4850020,
    isFollowed: false,
    updates: [
      {
        id: "tc-story-1",
        content: "Breaking: Compilation frameworks are evolving rapidly as dev chains prioritize instant hot-module-reloading. TypeScript strict-nulls checks are also seeing wider standardization across workspace repositories.",
        timestamp: "Yesterday, 3:15 PM",
        reactions: [
          { emoji: "👍", count: 48 },
          { emoji: "😮", count: 12 },
          { emoji: "🔥", count: 24 },
        ],
      },
    ],
  },
  {
    id: "netflix",
    name: "Netflix Updates",
    avatar: "https://images.unsplash.com/photo-1542744094-3a31f103e35f?w=150",
    description: "Sneak peeks, teasers, official release schedules, and behind-the-scenes content from your favorite Netflix originals and shows.",
    followers: 29015040,
    isFollowed: false,
    updates: [
      {
        id: "netflix-story-1",
        content: "The wait is over! Check out the official teaser trailer for our upcoming season of your favorite sci-fi thriller. Streaming starts next Friday! 🍿🎬",
        timestamp: "2 days ago",
        reactions: [
          { emoji: "❤️", count: 1205 },
          { emoji: "🔥", count: 980 },
          { emoji: "😮", count: 412 },
        ],
      },
    ],
  },
];
