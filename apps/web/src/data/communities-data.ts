import { Community, GroupMessage } from "@/types/communities";

export const INITIAL_COMMUNITIES: Community[] = [
  {
    id: "letschat-org",
    name: "Let's Chat Devs",
    avatar: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=150",
    description: "The official central workspace community for designers and software engineers building the Let's Chat real-time client. Discussions cover frontend design variables, api architecture, and deployment handshakes.",
    memberCount: 154,
    groups: [
      {
        id: "lc-org-announcements",
        name: "Announcements",
        type: "announcement",
        unreadCount: 1,
        lastMessage: "Olivia: Version 1.4.0 rollout details.",
        timestamp: "11:28 AM",
      },
      {
        id: "lc-org-frontend-ui",
        name: "Frontend UI Devs",
        type: "custom",
        unreadCount: 0,
        lastMessage: "Alex: Tailwind custom layouts look clean.",
        timestamp: "Yesterday",
      },
      {
        id: "lc-org-backend-api",
        name: "Backend API Engine",
        type: "custom",
        unreadCount: 3,
        lastMessage: "Sophia: Socket connection handshake fixed.",
        timestamp: "Yesterday",
      },
    ],
  },
  {
    id: "tech-enthusiasts",
    name: "Tech Enthusiasts",
    avatar: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=150",
    description: "A public discussion hub exploring developer productivity hacks, modular web architectures, and client performance optimizations.",
    memberCount: 420,
    groups: [
      {
        id: "tech-announcements",
        name: "Tech Meetups",
        type: "announcement",
        unreadCount: 0,
        lastMessage: "Admin: Next meetup date set for August 10.",
        timestamp: "Wed",
      },
      {
        id: "tech-ai",
        name: "Artificial Intelligence",
        type: "custom",
        unreadCount: 0,
        lastMessage: "Jonas: Gemini models look super fast! 🚀",
        timestamp: "Wed",
      },
    ],
  },
];

export const INITIAL_MESSAGES: Record<string, GroupMessage[]> = {
  "lc-org-announcements": [
    {
      id: "ann-1",
      sender: "Olivia Rhye",
      text: "Welcome everyone! This is the official announcement group for Let's Chat Devs. Key updates and version logs will be broadcasted here.",
      timestamp: "Today, 10:00 AM",
      isMe: false,
    },
    {
      id: "ann-2",
      sender: "Olivia Rhye",
      text: "Version 1.4.0 is now live! 🚀 Head over to the Status updates tab or review our new Channels broadcasting feed inside the client. React to the logs in the Channels section!",
      timestamp: "Today, 11:28 AM",
      isMe: false,
    },
  ],
  "lc-org-frontend-ui": [
    {
      id: "ui-1",
      sender: "Alex Green",
      text: "Hey guys, did we finalize the width bounds for the three-pane columns? I'm adjusting responsive CSS variables.",
      timestamp: "Yesterday, 3:15 PM",
      isMe: false,
    },
    {
      id: "ui-2",
      sender: "John Doe",
      text: "Yes! Pane 2 list width is capped at 430px max. Sidebar flex shrinks down to 76px when collapsed.",
      timestamp: "Yesterday, 3:20 PM",
      isMe: true,
    },
    {
      id: "ui-3",
      sender: "Alex Green",
      text: "Excellent. Tailwind custom layouts look clean. No borders overflow.",
      timestamp: "Yesterday, 3:22 PM",
      isMe: false,
    },
  ],
  "lc-org-backend-api": [
    {
      id: "api-1",
      sender: "Sophia Martinez",
      text: "We need to investigate some socket connection timeout alerts from staging. Let's make sure the client is correctly handshaking on dev servers.",
      timestamp: "Yesterday, 5:10 PM",
      isMe: false,
    },
    {
      id: "api-2",
      sender: "Sophia Martinez",
      text: "Socket connection handshake fixed. Deployed to dev server. Timeout resolved.",
      timestamp: "Yesterday, 6:05 PM",
      isMe: false,
    },
  ],
  "tech-announcements": [
    {
      id: "tech-ann-1",
      sender: "Workspace Admin",
      text: "Next virtual developer conference meetup date is set for August 10 at 6 PM EST. Calendar links have been shared.",
      timestamp: "Wednesday, 12:40 PM",
      isMe: false,
    },
  ],
  "tech-ai": [
    {
      id: "ai-1",
      sender: "Jonas Blue",
      text: "Anyone tested Gemini 3.5 Flash inside active IDE tools? The contextual parsing latency is exceptionally low.",
      timestamp: "Wednesday, 2:10 PM",
      isMe: false,
    },
    {
      id: "ai-2",
      sender: "Jonas Blue",
      text: "Gemini models look super fast! 🚀 Code generation is highly coherent.",
      timestamp: "Wednesday, 2:12 PM",
      isMe: false,
    },
  ],
};
