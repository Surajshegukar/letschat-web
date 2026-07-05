import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  email: string;
  avatarUrl?: string;
  about?: string;
  soundEnabled?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null; // Access token (in memory only)
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  setLoading: (isLoading: boolean) => void;
  updateUser: (fields: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  setAuth: (user, token) => {
    set({ user, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  updateUser: (fields) =>
    set((state) => ({
      user: state.user ? { ...state.user, ...fields } : null,
    })),
}));
