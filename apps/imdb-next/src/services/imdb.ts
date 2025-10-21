import axios from "axios"
import type { TitleResponse, SeasonResponse, EpisodeWithScore, SeasonWithScore } from "@/types/imdb"

const API_URL = "http://www.omdbapi.com/"
const API_KEY = "5799c6fa"

export async function getTitle(title: string): Promise<TitleResponse> {
  const response = await axios.get(`${API_URL}?t=${title}&apikey=${API_KEY}`)

  if (response.data.Error) {
    throw new Error(response.data.Error)
  }

  return response.data
}

export async function getSeason(
  titleId: string,
  seasonNumber: number
): Promise<SeasonResponse> {
  const response = await axios.get(
    `${API_URL}?t=${titleId}&Season=${seasonNumber}&apikey=${API_KEY}`
  )

  if (response.data.Error) {
    throw new Error(response.data.Error)
  }

  return response.data
}

export async function getAllSeasons(
  titleId: string,
  totalSeasons: number
): Promise<EpisodeWithScore[]> {
  const storage = localStorage.getItem(titleId)
  if (storage) {
    return JSON.parse(storage)
  }

  const allEpisodes: EpisodeWithScore[] = []

  for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
    const seasonData = await getSeason(titleId, seasonNumber)

    if (seasonData.Episodes) {
      const episodesWithScore = seasonData.Episodes.map((episode) => ({
        ...episode,
        score: episode.imdbRating === "N/A" ? 0 : parseFloat(episode.imdbRating),
      }))
      allEpisodes.push(...episodesWithScore)
    }
  }

  localStorage.setItem(titleId, JSON.stringify(allEpisodes))
  return allEpisodes
}

function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0

  const sorted = [...numbers].sort((a, b) => a - b)
  const middleIndex = Math.floor(sorted.length / 2)

  if (sorted.length % 2 === 0) {
    return (sorted[middleIndex - 1] + sorted[middleIndex]) / 2
  } else {
    return sorted[middleIndex]
  }
}

export async function getSeasonsWithScores(
  titleId: string,
  totalSeasons: number
): Promise<SeasonWithScore[]> {
  const cacheKey = `${titleId}_seasons`
  const storage = localStorage.getItem(cacheKey)
  if (storage) {
    return JSON.parse(storage)
  }

  const seasonsWithScores: SeasonWithScore[] = []

  for (let seasonNumber = 1; seasonNumber <= totalSeasons; seasonNumber++) {
    const seasonData = await getSeason(titleId, seasonNumber)

    if (seasonData.Episodes) {
      const validScores = seasonData.Episodes
        .map((episode) => episode.imdbRating)
        .filter((rating) => rating !== "N/A" && !isNaN(Number(rating)))
        .map((rating) => Number(rating))

      const medianScore = calculateMedian(validScores)

      seasonsWithScores.push({
        seasonNumber,
        medianScore,
        episodeCount: seasonData.Episodes.length,
      })
    }
  }

  const sorted = seasonsWithScores.sort((a, b) => b.medianScore - a.medianScore)

  localStorage.setItem(cacheKey, JSON.stringify(sorted))
  return sorted
}
