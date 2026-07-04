import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { ChatRoom, Message } from "@/types/chat";
import { mockRooms, initialOliviaMessages } from "@/constants/mock-data";

interface ChatState {
  rooms: ChatRoom[];
  messages: Record<string, Message[]>; // roomId -> messages
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  sendMessage: (roomId: string, content: string) => void;
  sendVoiceNote: (roomId: string, duration: string) => void;
  sendAttachment: (roomId: string, type: "image" | "document") => void;
  receiveMessage: (roomId: string, message: Message) => void;
  clearUnread: (roomId: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set, get) => ({
      rooms: mockRooms,
      messages: { olivia: initialOliviaMessages },
      activeRoomId: null,

      setActiveRoomId: (activeRoomId) => {
        set({ activeRoomId });
        if (activeRoomId) {
          get().clearUnread(activeRoomId);
        }
      },

      sendMessage: (roomId, content) => {
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          senderId: "me",
          senderName: "John Doe",
          content,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read",
        };

        set((state) => {
          const roomMessages = state.messages[roomId] || [];
          return {
            messages: {
              ...state.messages,
              [roomId]: [...roomMessages, newMsg],
            },
            rooms: state.rooms.map((r) =>
              r.id === roomId
                ? { ...r, lastMessage: content, timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
                : r
            ),
          };
        });
      },

      sendVoiceNote: (roomId, duration) => {
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          senderId: "me",
          senderName: "John Doe",
          content: "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read",
          attachment: {
            name: "Voice note",
            size: duration,
            type: "audio",
          },
        };

        set((state) => {
          const roomMessages = state.messages[roomId] || [];
          return {
            messages: {
              ...state.messages,
              [roomId]: [...roomMessages, newMsg],
            },
            rooms: state.rooms.map((r) =>
              r.id === roomId
                ? { ...r, lastMessage: "Voice note", timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) }
                : r
            ),
          };
        });
      },

      sendAttachment: (roomId, type) => {
        const newMsg: Message = {
          id: `msg-${Date.now()}`,
          senderId: "me",
          senderName: "John Doe",
          content: type === "image" ? "Check out this beautiful setup!" : "",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          status: "read",
          attachment: {
            name: type === "image" ? "workspace_mockup.jpg" : "letschat_documentation.pdf",
            size: type === "image" ? "142 KB" : "1.2 MB",
            url: type === "image" ? "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600" : undefined,
            type,
          },
        };

        set((state) => {
          const roomMessages = state.messages[roomId] || [];
          return {
            messages: {
              ...state.messages,
              [roomId]: [...roomMessages, newMsg],
            },
            rooms: state.rooms.map((r) =>
              r.id === roomId
                ? {
                    ...r,
                    lastMessage: type === "image" ? "workspace_mockup.jpg" : "letschat_documentation.pdf",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  }
                : r
            ),
          };
        });
      },

      receiveMessage: (roomId, message) => {
        set((state) => {
          const roomMessages = state.messages[roomId] || [];
          if (roomMessages.some((msg) => msg.id === message.id)) {
            return state;
          }
          const isCurrentActive = state.activeRoomId === roomId;
          return {
            messages: {
              ...state.messages,
              [roomId]: [...roomMessages, message],
            },
            rooms: state.rooms.map((r) =>
              r.id === roomId
                ? {
                    ...r,
                    lastMessage: message.content || (message.attachment ? message.attachment.name : ""),
                    timestamp: message.timestamp,
                    unreadCount: isCurrentActive ? 0 : (r.unreadCount || 0) + 1,
                  }
                : r
            ),
          };
        });
      },

      clearUnread: (roomId) => {
        set((state) => ({
          rooms: state.rooms.map((r) =>
            r.id === roomId ? { ...r, unreadCount: 0 } : r
          ),
        }));
      },
    }),
    {
      name: "letschat-chat-store",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useChatStore;
