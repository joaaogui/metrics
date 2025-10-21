import { create } from "zustand"
import type { Artist, AlbumWithTracks } from "@/types/spotify"

interface SpotifyStore {
  artistName: string
  artistInfo: Artist | null
  albums: AlbumWithTracks[]
  setArtistName: (name: string) => void
  setArtistInfo: (info: Artist | null) => void
  setAlbums: (albums: AlbumWithTracks[]) => void
  reset: () => void
}

export const useSpotifyStore = create<SpotifyStore>((set) => ({
  artistName: "",
  artistInfo: null,
  albums: [],
  setArtistName: (name) => set({ artistName: name }),
  setArtistInfo: (info) => set({ artistInfo: info }),
  setAlbums: (albums) => set({ albums }),
  reset: () => set({ artistName: "", artistInfo: null, albums: [] }),
}))
