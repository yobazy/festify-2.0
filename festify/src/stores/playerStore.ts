import { create } from "zustand";

interface PlayerState {
  activePlaylistUri: string | null;
  isPlayerVisible: boolean;
  setActivePlaylist: (uri: string | null) => void;
  togglePlayer: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  activePlaylistUri: null,
  isPlayerVisible: false,
  setActivePlaylist: (uri) =>
    set({ activePlaylistUri: uri, isPlayerVisible: !!uri }),
  togglePlayer: () => set((state) => ({ isPlayerVisible: !state.isPlayerVisible })),
}));
