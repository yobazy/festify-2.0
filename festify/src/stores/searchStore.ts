import { create } from "zustand";

interface SearchState {
  query: string;
  location: string | null;
  genreFilter: "all" | "festival" | "electronic";
  currentPage: number;
  setQuery: (q: string) => void;
  setLocation: (loc: string | null) => void;
  setGenreFilter: (filter: "all" | "festival" | "electronic") => void;
  setCurrentPage: (page: number) => void;
  reset: () => void;
}

export const useSearchStore = create<SearchState>((set) => ({
  query: "",
  location: null,
  genreFilter: "all",
  currentPage: 1,
  setQuery: (query) => set({ query, currentPage: 1 }),
  setLocation: (location) => set({ location, currentPage: 1 }),
  setGenreFilter: (genreFilter) => set({ genreFilter, currentPage: 1 }),
  setCurrentPage: (currentPage) => set({ currentPage }),
  reset: () =>
    set({
      query: "",
      location: null,
      genreFilter: "all",
      currentPage: 1,
    }),
}));
