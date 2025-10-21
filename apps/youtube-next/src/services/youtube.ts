import axios from "axios"
import dayjs from "dayjs"
import type { Video, ChannelInfo } from "@/types/youtube"

const API_URL = "https://www.googleapis.com/youtube/v3"
const API_KEY = "AIzaSyBy5PsZmq3zn2jSdnrn1bGT9lsF-6NwVx4"

async function getPlaylistItems(
  playlistId: string,
  pageToken = ""
): Promise<any[]> {
  const url = `${API_URL}/playlistItems?part=snippet%2CcontentDetails&maxResults=50&playlistId=${playlistId}&key=${API_KEY}&pageToken=${pageToken}`
  const response = await axios.get(url)
  const allVideos = [...response.data.items]

  if (response.data.nextPageToken) {
    const nextVideos = await getPlaylistItems(
      playlistId,
      response.data.nextPageToken
    )
    allVideos.push(...nextVideos)
  }

  return allVideos
}

async function getVideo(videoId: string) {
  const url = `${API_URL}/videos?part=statistics&id=${videoId}&key=${API_KEY}`
  return await axios.get(url)
}

async function getVideoInfo(videoId: string, attribute: string) {
  const storage = localStorage.getItem(videoId)
  let statistics

  if (storage) {
    statistics = JSON.parse(storage)
  } else {
    const video = await getVideo(videoId)
    statistics = video.data.items[0].statistics
    localStorage.setItem(videoId, JSON.stringify(statistics))
  }

  return Number(statistics[attribute])
}

function getDaysToToday(videoDate: string) {
  const today = dayjs()
  return today.diff(videoDate, "day")
}

function getScore(
  views: number,
  days: number,
  comments: number,
  likes: number
) {
  const viewVelocity = (views * 15) / (days + 30)
  const engagement = likes * 0.3 + comments * 0.1
  return viewVelocity + engagement
}

export async function searchChannel(name: string): Promise<ChannelInfo> {
  const url = `${API_URL}/search?part=snippet&q=${name}&type=channel&key=${API_KEY}`
  const result = await axios.get(url)
  const channel = result.data.items[0]
  return channel.snippet
}

export async function getChannelVideos(channelId: string): Promise<Video[]> {
  const storage = localStorage.getItem(channelId)
  if (storage) {
    return JSON.parse(storage)
  }

  const channelUrl = `${API_URL}/channels?part=contentDetails&id=${channelId}&key=${API_KEY}`
  const channel = await axios.get(channelUrl)
  const uploadsPlaylistId =
    channel.data.items[0].contentDetails.relatedPlaylists.uploads

  const channelVideos = await getPlaylistItems(uploadsPlaylistId)
  const videos: Video[] = []

  for (const video of channelVideos) {
    const videoContent = video.contentDetails
    const videoId = videoContent.videoId
    const views = await getVideoInfo(videoId, "viewCount")
    const likes = await getVideoInfo(videoId, "likeCount")
    const comments = await getVideoInfo(videoId, "commentCount")
    const favorites = await getVideoInfo(videoId, "favoriteCount")
    const days = getDaysToToday(videoContent.videoPublishedAt)
    const score = getScore(views, days, comments, likes)

    videos.push({
      videoId,
      title: video.snippet.title,
      days,
      views,
      likes,
      comments,
      favorites,
      score,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnail: video.snippet.thumbnails.default.url,
      description: video.snippet.description,
    })
  }

  localStorage.setItem(channelId, JSON.stringify(videos))
  return videos
}
