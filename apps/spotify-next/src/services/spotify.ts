import axios from "axios"
import type {
  SearchArtistsResponse,
  ArtistAlbumsResponse,
  Artist,
  Album,
  Track,
  AuthTokenResponse,
  AlbumWithTracks,
} from "@/types/spotify"

const API_URL = "https://api.spotify.com/v1/"
const AUTH_URL = "https://accounts.spotify.com/api/token"
const CLIENT_ID = "645b8d692c744abcacdb32479d3aebc5"
const CLIENT_SECRET = "043ad2521c274c84b1305418e010deb5"

let accessToken: string | null = null

async function getAccessToken(): Promise<string> {
  if (accessToken) {
    return accessToken
  }

  const params = new URLSearchParams()
  params.append("grant_type", "client_credentials")
  params.append("client_id", CLIENT_ID)
  params.append("client_secret", CLIENT_SECRET)

  const response = await axios.post<AuthTokenResponse>(AUTH_URL, params, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  })

  accessToken = response.data.access_token
  return accessToken
}

async function createAuthHeaders() {
  const token = await getAccessToken()
  return {
    Authorization: `Bearer ${token}`,
  }
}

export async function searchArtist(artistName: string): Promise<Artist> {
  const headers = await createAuthHeaders()
  const response = await axios.get<SearchArtistsResponse>(
    `${API_URL}search?q=${encodeURIComponent(artistName)}&type=artist`,
    { headers }
  )

  if (!response.data.artists.items.length) {
    throw new Error("Artist not found")
  }

  return response.data.artists.items[0]
}

export async function getArtistAlbums(
  artistId: string,
  offset = 0
): Promise<Album[]> {
  const headers = await createAuthHeaders()
  const response = await axios.get<ArtistAlbumsResponse>(
    `${API_URL}artists/${artistId}/albums?offset=${offset}&limit=50&include_groups=album,single`,
    { headers }
  )

  return response.data.items
}

export async function getAllArtistAlbums(artistId: string): Promise<Album[]> {
  const allAlbums: Album[] = []
  let offset = 0
  let hasMore = true

  while (hasMore) {
    const albums = await getArtistAlbums(artistId, offset)
    allAlbums.push(...albums)

    if (albums.length < 50) {
      hasMore = false
    } else {
      offset += 50
    }
  }

  return allAlbums
}

export async function getAlbumTracks(albumIds: string[]): Promise<Track[]> {
  const headers = await createAuthHeaders()
  const chunks: string[][] = []

  for (let index = 0; index < albumIds.length; index += 20) {
    chunks.push(albumIds.slice(index, index + 20))
  }

  const allTracks: Track[] = []

  for (const chunk of chunks) {
    const response = await axios.get<{ albums: { tracks: { items: Track[] } }[] }>(
      `${API_URL}albums?ids=${chunk.join(",")}`,
      { headers }
    )

    response.data.albums.forEach((album) => {
      allTracks.push(...album.tracks.items)
    })
  }

  return allTracks
}

export async function getTrackDetails(trackIds: string[]): Promise<Track[]> {
  const headers = await createAuthHeaders()
  const chunks: string[][] = []

  for (let index = 0; index < trackIds.length; index += 50) {
    chunks.push(trackIds.slice(index, index + 50))
  }

  const allTracks: Track[] = []

  for (const chunk of chunks) {
    const response = await axios.get<{ tracks: Track[] }>(
      `${API_URL}tracks?ids=${chunk.join(",")}`,
      { headers }
    )

    allTracks.push(...response.data.tracks)
  }

  return allTracks
}

export async function getArtistAlbumsWithTracks(
  artistName: string
): Promise<AlbumWithTracks[]> {
  const storage = localStorage.getItem(artistName)
  if (storage) {
    return JSON.parse(storage)
  }

  const artist = await searchArtist(artistName)
  const albums = await getAllArtistAlbums(artist.id)

  const albumIds = albums.map((album) => album.id)
  const allTracks = await getAlbumTracks(albumIds)

  const trackIds = allTracks.map((track) => track.id)
  const tracksWithDetails = await getTrackDetails(trackIds)

  const albumsWithTracks: AlbumWithTracks[] = albums.map((album) => {
    const tracks = tracksWithDetails.filter((track) => track.album.id === album.id)
    const averagePopularity =
      tracks.reduce((sum, track) => sum + track.popularity, 0) / tracks.length || 0

    return {
      ...album,
      tracks,
      averagePopularity,
    }
  })

  localStorage.setItem(artistName, JSON.stringify(albumsWithTracks))
  return albumsWithTracks
}
