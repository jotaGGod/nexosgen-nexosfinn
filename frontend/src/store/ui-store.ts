import { create } from "zustand";

/** Estado de interface que precisa ser compartilhado entre telas. */
interface UIState {
  /** Sidebar aberta no mobile (no desktop ela é fixa). */
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: false,
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
