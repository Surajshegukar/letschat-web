import { create } from "zustand";
import { Message } from "@/types/chat";

interface ChatState {
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  replyingToMessage: Message | null;
  setReplyingToMessage: (message: Message | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeRoomId: null,
  setActiveRoomId: (activeRoomId) => set({ activeRoomId, replyingToMessage: null }),
  replyingToMessage: null,
  setReplyingToMessage: (replyingToMessage) => set({ replyingToMessage }),
}));

export default useChatStore;
