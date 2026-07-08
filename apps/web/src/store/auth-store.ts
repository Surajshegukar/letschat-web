import { create } from "zustand";

export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
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
    const normalizedUser = {
      ...user,
      id: user.id || (user as { _id?: string })._id || "",
      avatarUrl: user.avatarUrl || (user as { avatar?: string }).avatar,
    };
    set({ user: normalizedUser, token, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  updateUser: (fields) =>
    set((state) => {
      if (!state.user) return { user: null };
      const updatedUser = { ...state.user, ...fields };
      updatedUser.id = updatedUser.id || (updatedUser as { _id?: string })._id || "";
      updatedUser.avatarUrl = updatedUser.avatarUrl || (updatedUser as { avatar?: string }).avatar;
      return { user: updatedUser };
    }),
}));
