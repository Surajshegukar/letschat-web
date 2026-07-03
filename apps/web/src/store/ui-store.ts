import { create } from "zustand";

interface UIState {
  isProfileDrawerOpen: boolean;
  openProfileDrawer: () => void;
  closeProfileDrawer: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  isProfileDrawerOpen: false,
  openProfileDrawer: () => set({ isProfileDrawerOpen: true }),
  closeProfileDrawer: () => set({ isProfileDrawerOpen: false }),
}));

export default useUIStore;
