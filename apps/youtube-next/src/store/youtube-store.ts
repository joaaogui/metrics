import { create } from "zustand"
import type { Video, ChannelInfo } from "@/types/youtube"

interface YoutubeStore {
  channelName: string
  channelInfo: ChannelInfo | null
  videos: Video[]
  setChannelName: (name: string) => void
  setChannelInfo: (info: ChannelInfo | null) => void
  setVideos: (videos: Video[]) => void
  reset: () => void
}

export const useYoutubeStore = create<YoutubeStore>((set) => ({
  channelName: "",
  channelInfo: null,
  videos: [],
  setChannelName: (name) => set({ channelName: name }),
  setChannelInfo: (info) => set({ channelInfo: info }),
  setVideos: (videos) => set({ videos }),
  reset: () => set({ channelName: "", channelInfo: null, videos: [] }),
}))
