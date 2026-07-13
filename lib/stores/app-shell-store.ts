import { create } from "zustand";

type AppShellState = {
  commandMenuOpen: boolean;
  mobileSidebarOpen: boolean;
  setCommandMenuOpen: (value: boolean) => void;
  setMobileSidebarOpen: (value: boolean) => void;
};

export const useAppShellStore = create<AppShellState>((set) => ({
  commandMenuOpen: false,
  mobileSidebarOpen: false,
  setCommandMenuOpen: (value) => set({ commandMenuOpen: value }),
  setMobileSidebarOpen: (value) => set({ mobileSidebarOpen: value }),
}));
