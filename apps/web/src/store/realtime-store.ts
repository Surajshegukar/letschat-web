import { create } from "zustand";

interface RealtimeState {
  onlineUsers: Set<string>;
  typingUsers: Record<string, string[]>; // conversationId -> array of usernames
  setUserOnline: (userId: string) => void;
  setUserOffline: (userId: string) => void;
  setOnlineUsers: (userIds: string[]) => void;
  setTyping: (conversationId: string, username: string) => void;
  removeTyping: (conversationId: string, username: string) => void;
  isOnline: (userId: string) => boolean;
}

export const useRealtimeStore = create<RealtimeState>((set, get) => ({
  onlineUsers: new Set<string>(),
  typingUsers: {},

  setUserOnline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.add(userId);
      return { onlineUsers: next };
    }),

  setUserOffline: (userId) =>
    set((state) => {
      const next = new Set(state.onlineUsers);
      next.delete(userId);
      return { onlineUsers: next };
    }),

  setOnlineUsers: (userIds) =>
    set(() => ({
      onlineUsers: new Set(userIds),
    })),

  setTyping: (conversationId, username) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      if (current.includes(username)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: [...current, username],
        },
      };
    }),

  removeTyping: (conversationId, username) =>
    set((state) => {
      const current = state.typingUsers[conversationId] || [];
      if (!current.includes(username)) return state;
      return {
        typingUsers: {
          ...state.typingUsers,
          [conversationId]: current.filter((u) => u !== username),
        },
      };
    }),

  isOnline: (userId) => get().onlineUsers.has(userId),
}));

export default useRealtimeStore;
