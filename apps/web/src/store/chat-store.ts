import { create } from "zustand";

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  roomId: string;
  createdAt: string;
}

interface Room {
  id: string;
  name: string;
  isGroup: boolean;
  participants: string[];
}

interface ChatState {
  rooms: Room[];
  messages: Record<string, Message[]>; // roomId -> messages
  activeRoomId: string | null;
  setRooms: (rooms: Room[]) => void;
  setActiveRoom: (roomId: string | null) => void;
  addMessage: (roomId: string, message: Message) => void;
  setMessages: (roomId: string, messages: Message[]) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  rooms: [],
  messages: {},
  activeRoomId: null,
  setRooms: (rooms) => set({ rooms }),
  setActiveRoom: (activeRoomId) => set({ activeRoomId }),
  addMessage: (roomId, message) =>
    set((state) => {
      const roomMessages = state.messages[roomId] || [];
      // Prevent duplicates
      if (roomMessages.some((msg) => msg.id === message.id)) {
        return state;
      }
      return {
        messages: {
          ...state.messages,
          [roomId]: [...roomMessages, message],
        },
      };
    }),
  setMessages: (roomId, messages) =>
    set((state) => ({
      messages: {
        ...state.messages,
        [roomId]: messages,
      },
    })),
}));
