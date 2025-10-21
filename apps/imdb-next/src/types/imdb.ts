export interface Title {
  Title: string
  Year: string
  imdbID: string
  Type: string
  Poster: string
  totalSeasons?: string
}

export interface Episode {
  Title: string
  Released: string
  Episode: string
  imdbRating: string
  imdbID: string
}

export interface Season {
  Title: string
  Season: string
  totalSeasons: string
  Episodes: Episode[]
}

export interface TitleResponse {
  Response: string
  Error?: string
  Title?: string
  Year?: string
  imdbID?: string
  Type?: string
  Poster?: string
  totalSeasons?: string
}

export interface SeasonResponse {
  Response: string
  Error?: string
  Title?: string
  Season?: string
  totalSeasons?: string
  Episodes?: Episode[]
}

export interface EpisodeWithScore extends Episode {
  score: number
}

export interface SeasonWithScore {
  seasonNumber: number
  medianScore: number
  episodeCount: number
}
