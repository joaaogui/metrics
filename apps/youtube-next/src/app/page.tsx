"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { DataTable } from "@repo/ui/data-table"
import { searchChannel, getChannelVideos } from "@/services/youtube"
import { useYoutubeStore } from "@/store/youtube-store"
import type { Video } from "@/types/youtube"
import Image from "next/image"

const columns: ColumnDef<Video>[] = [
  {
    accessorKey: "title",
    header: "Title",
    size: 500,
    cell: ({ row }) => {
      const video = row.original
      return (
        <div className="flex items-center gap-2 min-w-0 overflow-hidden w-full">
          <Image
            src={video.thumbnail}
            alt={video.title}
            width={120}
            height={90}
            className="rounded flex-shrink-0"
          />
          <a
            href={video.url}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline truncate min-w-0 block"
            title={video.title}
          >
            {video.title}
          </a>
        </div>
      )
    },
  },
  {
    accessorKey: "days",
    header: "Age (days)",
    size: 120,
  },
  {
    accessorKey: "score",
    header: "Score",
    size: 120,
    cell: ({ row }) => {
      const score = row.getValue("score") as number
      return score ? parseInt(score.toString()).toLocaleString("pt-BR") : ""
    },
  },
  {
    accessorKey: "views",
    header: "Views",
    size: 130,
    cell: ({ row }) => {
      const views = row.getValue("views") as number
      return views ? views.toLocaleString("pt-BR") : ""
    },
  },
  {
    accessorKey: "likes",
    header: "Likes",
    size: 120,
    cell: ({ row }) => {
      const likes = row.getValue("likes") as number
      return likes ? likes.toLocaleString("pt-BR") : ""
    },
  },
  {
    accessorKey: "comments",
    header: "Comments",
    size: 130,
    cell: ({ row }) => {
      const comments = row.getValue("comments") as number
      return comments ? comments.toLocaleString("pt-BR") : ""
    },
  },
  {
    accessorKey: "favorites",
    header: "Favorites",
    size: 100,
  },
]

export default function HomePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { channelInfo, videos, setChannelInfo, setVideos } =
    useYoutubeStore()
  const [searchInput, setSearchInput] = useState("")

  const searchMutation = useMutation({
    mutationFn: async (name: string) => {
      const info = await searchChannel(name)
      setChannelInfo(info)
      const vids = await getChannelVideos(info.channelId)
      setVideos(vids)
    },
  })

  useEffect(() => {
    const query = searchParams.get("q")
    if (query && query !== searchInput) {
      setSearchInput(query)
      searchMutation.mutate(query)
    }
  }, [searchParams])

  const handleSearch = () => {
    if (searchInput.trim()) {
      router.push(`?q=${encodeURIComponent(searchInput)}`)
      searchMutation.mutate(searchInput)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-start p-8">
      <div
        className={`flex w-full flex-col items-center gap-6 transition-all ${
          videos.length > 0 ? "mb-4" : ""
        }`}
      >
        <div className={`flex w-full items-center gap-4 ${videos.length > 0 ? "flex-row" : "flex-col"}`}>
          <Input
            className={`h-10 ${videos.length === 0 ? "max-w-md" : "flex-1"}`}
            placeholder="Search for a youtube channel"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {channelInfo && (
          <a
            href={`https://www.youtube.com/channel/${channelInfo.channelId}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2"
          >
            <Image
              src={channelInfo.thumbnails.default.url}
              alt={channelInfo.channelTitle}
              width={48}
              height={48}
              className="rounded-full"
            />
            <span className="text-lg font-medium">{channelInfo.channelTitle}</span>
          </a>
        )}
      </div>

      {searchMutation.isPending && (
        <div className="mt-8 text-center">Loading...</div>
      )}

      {videos.length > 0 && (
        <div className="w-full">
          <DataTable columns={columns} data={videos} />
        </div>
      )}
    </div>
  )
}
