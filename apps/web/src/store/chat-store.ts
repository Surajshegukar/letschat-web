import { create } from "zustand";
import { Message } from "@/types/chat";

interface ChatState {
  activeRoomId: string | null;
  setActiveRoomId: (roomId: string | null) => void;
  replyingToMessage: Message | null;
  setReplyingToMessage: (message: Message | null) => void;
  editingMessage: Message | null;
  setEditingMessage: (message: Message | null) => void;
}

export const useChatStore = create<ChatState>((set) => ({
  activeRoomId: null,
  setActiveRoomId: (activeRoomId) => set({ activeRoomId, replyingToMessage: null, editingMessage: null }),
  replyingToMessage: null,
  setReplyingToMessage: (replyingToMessage) => set({ replyingToMessage, editingMessage: null }),
  editingMessage: null,
  setEditingMessage: (editingMessage) => set({ editingMessage, replyingToMessage: null }),
}));

export default useChatStore;
