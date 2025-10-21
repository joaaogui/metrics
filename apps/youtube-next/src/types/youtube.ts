export interface Video {
  videoId: string
  title: string
  days: number
  views: number
  likes: number
  comments: number
  favorites: number
  score: number
  url: string
  thumbnail: string
  description: string
}

export interface ChannelInfo {
  channelId: string
  channelTitle: string
  description: string
  thumbnails: {
    default: {
      url: string
    }
  }
}
