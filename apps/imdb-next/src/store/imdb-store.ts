import { create } from "zustand"
import type { EpisodeWithScore, TitleResponse, SeasonWithScore } from "@/types/imdb"

interface ImdbStore {
  searchQuery: string
  titleInfo: TitleResponse | null
  episodes: EpisodeWithScore[]
  seasons: SeasonWithScore[]
  setSearchQuery: (query: string) => void
  setTitleInfo: (info: TitleResponse | null) => void
  setEpisodes: (episodes: EpisodeWithScore[]) => void
  setSeasons: (seasons: SeasonWithScore[]) => void
  reset: () => void
}

export const useImdbStore = create<ImdbStore>((set) => ({
  searchQuery: "",
  titleInfo: null,
  episodes: [],
  seasons: [],
  setSearchQuery: (query) => set({ searchQuery: query }),
  setTitleInfo: (info) => set({ titleInfo: info }),
  setEpisodes: (episodes) => set({ episodes }),
  setSeasons: (seasons) => set({ seasons }),
  reset: () => set({ searchQuery: "", titleInfo: null, episodes: [], seasons: [] }),
}))
