export interface Artist {
  id: string
  name: string
  images: {
    url: string
  }[]
  followers: {
    total: number
  }
  genres: string[]
  popularity: number
  external_urls: {
    spotify: string
  }
}

export interface Album {
  id: string
  name: string
  release_date: string
  total_tracks: number
  images: {
    url: string
  }[]
  album_type: string
  artists: {
    id: string
    name: string
  }[]
  external_urls: {
    spotify: string
  }
}

export interface Track {
  id: string
  name: string
  popularity: number
  duration_ms: number
  track_number: number
  album: {
    id: string
    name: string
    release_date: string
    images: {
      url: string
    }[]
  }
  artists: {
    id: string
    name: string
  }[]
  external_urls: {
    spotify: string
  }
}

export interface SearchArtistsResponse {
  artists: {
    items: Artist[]
  }
}

export interface ArtistAlbumsResponse {
  items: Album[]
  next: string | null
  offset: number
  total: number
}

export interface AuthTokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

export interface AlbumWithTracks extends Album {
  tracks: Track[]
  averagePopularity: number
}
