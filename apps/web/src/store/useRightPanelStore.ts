import { create } from "zustand";
import { persist } from "zustand/middleware";

interface RightPanelState {
  open: boolean;
  toggle: () => void;
  setOpen: (open: boolean) => void;
}

export const useRightPanelStore = create<RightPanelState>()(
  persist(
    (set, get) => ({
      open: false,
      toggle: () => set({ open: !get().open }),
      setOpen: (open) => set({ open }),
    }),
    { name: "knowledgehub-right-panel" },
  ),
);
