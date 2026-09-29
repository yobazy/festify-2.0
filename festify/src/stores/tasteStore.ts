"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Artist } from "@/types/artist";
import type { Event } from "@/types/event";

type StoredArtist = Pick<
  Artist,
  "artist_id" | "artist_name" | "img_url" | "genres" | "popularity" | "spotify_link"
>;

type StoredEvent = Pick<
  Event,
  | "event_id"
  | "event_name"
  | "event_date"
  | "event_end_date"
  | "event_location"
  | "event_venue"
  | "festivalind"
  | "electronicgenreind"
  | "img_url"
  | "alt_img"
  | "use_alt"
  | "artists"
>;

interface TasteState {
  followedArtists: StoredArtist[];
  savedEvents: StoredEvent[];
  preferredGenres: string[];
  toggleFollowArtist: (artist: Artist) => void;
  toggleSaveEvent: (event: Event) => void;
  togglePreferredGenre: (genre: string) => void;
  clearTaste: () => void;
}

export const useTasteStore = create<TasteState>()(
  persist(
    (baseSet) => {
      // persist writes storage on every set. With skipHydration, a write before
      // TasteStoreHydrator runs would overwrite saved taste with empty state, so
      // load it first (localStorage is sync, so rehydrate applies immediately).
      const set = (
        partial:
          | Partial<TasteState>
          | ((state: TasteState) => Partial<TasteState>)
      ) => {
        if (!useTasteStore.persist.hasHydrated()) {
          void useTasteStore.persist.rehydrate();
        }
        baseSet(partial);
      };

      return {
      followedArtists: [],
      savedEvents: [],
      preferredGenres: [],
      toggleFollowArtist: (artist) =>
        set((state) => {
          const exists = state.followedArtists.some(
            (entry) => entry.artist_id === artist.artist_id
          );

          if (exists) {
            return {
              followedArtists: state.followedArtists.filter(
                (entry) => entry.artist_id !== artist.artist_id
              ),
            };
          }

          const nextGenres = new Set(state.preferredGenres);
          artist.genres?.forEach((genre) => nextGenres.add(genre));

          return {
            followedArtists: [
              {
                artist_id: artist.artist_id,
                artist_name: artist.artist_name,
                img_url: artist.img_url,
                genres: artist.genres,
                popularity: artist.popularity,
                spotify_link: artist.spotify_link,
              },
              ...state.followedArtists,
            ],
            preferredGenres: Array.from(nextGenres),
          };
        }),
      toggleSaveEvent: (event) =>
        set((state) => {
          const exists = state.savedEvents.some(
            (entry) => entry.event_id === event.event_id
          );

          if (exists) {
            return {
              savedEvents: state.savedEvents.filter(
                (entry) => entry.event_id !== event.event_id
              ),
            };
          }

          return {
            savedEvents: [
              {
                event_id: event.event_id,
                event_name: event.event_name,
                event_date: event.event_date,
                event_end_date: event.event_end_date,
                event_location: event.event_location,
                event_venue: event.event_venue,
                festivalind: event.festivalind,
                electronicgenreind: event.electronicgenreind,
                img_url: event.img_url,
                alt_img: event.alt_img,
                use_alt: event.use_alt,
                artists: event.artists,
              },
              ...state.savedEvents,
            ],
          };
        }),
      togglePreferredGenre: (genre) =>
        set((state) => {
          const exists = state.preferredGenres.some(
            (entry) => entry.toLowerCase() === genre.toLowerCase()
          );

          if (exists) {
            return {
              preferredGenres: state.preferredGenres.filter(
                (entry) => entry.toLowerCase() !== genre.toLowerCase()
              ),
            };
          }

          return {
            preferredGenres: [...state.preferredGenres, genre],
          };
        }),
      clearTaste: () =>
        set({
          followedArtists: [],
          savedEvents: [],
          preferredGenres: [],
        }),
      };
    },
    {
      name: "festify-taste",
      storage: createJSONStorage(() => localStorage),
      // Server HTML has no localStorage; rehydrate after mount (TasteStoreHydrator)
      // so the first client render matches it.
      skipHydration: true,
      partialize: (state) => ({
        followedArtists: state.followedArtists,
        savedEvents: state.savedEvents,
        preferredGenres: state.preferredGenres,
      }),
    }
  )
);
