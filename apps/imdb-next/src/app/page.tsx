"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { DataTable } from "@repo/ui/data-table"
import { getTitle, getSeasonsWithScores } from "@/services/imdb"
import { useImdbStore } from "@/store/imdb-store"
import type { SeasonWithScore } from "@/types/imdb"
import Image from "next/image"

const columns: ColumnDef<SeasonWithScore>[] = [
  {
    accessorKey: "seasonNumber",
    header: "Season",
    size: 150,
    cell: ({ row }) => {
      const seasonNumber = row.getValue("seasonNumber") as number
      return `Season ${seasonNumber}`
    },
  },
  {
    accessorKey: "medianScore",
    header: "Median IMDb Rating",
    size: 200,
    cell: ({ row }) => {
      const score = row.getValue("medianScore") as number
      return score === 0 ? "N/A" : score.toFixed(1)
    },
  },
  {
    accessorKey: "episodeCount",
    header: "Episodes",
    size: 150,
  },
]

function HomeContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { titleInfo, seasons, setTitleInfo, setSeasons } = useImdbStore()
  const [searchInput, setSearchInput] = useState("")

  const searchMutation = useMutation({
    mutationFn: async (title: string) => {
      const titleData = await getTitle(title)

      if (titleData.Type !== "series") {
        throw new Error("Only TV series are supported")
      }

      setTitleInfo(titleData)

      const totalSeasons = parseInt(titleData.totalSeasons || "0")
      const seasonsData = await getSeasonsWithScores(titleData.Title || title, totalSeasons)
      setSeasons(seasonsData)
    },
  })

  useEffect(() => {
    const query = searchParams.get("q")
    if (query && query !== searchInput) {
      setSearchInput(query)
      searchMutation.mutate(query)
    }
  }, [searchParams, searchInput, searchMutation])

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
          seasons.length > 0 ? "mb-4" : ""
        }`}
      >
        <div className={`flex w-full items-center gap-4 ${seasons.length > 0 ? "flex-row" : "flex-col"}`}>
          <Input
            className={`h-10 ${seasons.length === 0 ? "max-w-md" : "flex-1"}`}
            placeholder="Search for a TV series (e.g., Breaking Bad)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {titleInfo && (
          <div className="flex items-center gap-4">
            {titleInfo.Poster && titleInfo.Poster !== "N/A" && (
              <Image
                src={titleInfo.Poster}
                alt={titleInfo.Title || ""}
                width={100}
                height={150}
                className="rounded"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{titleInfo.Title}</h2>
              <p className="text-gray-600">
                {titleInfo.Year} - {titleInfo.totalSeasons} Season{parseInt(titleInfo.totalSeasons || "0") > 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}
      </div>

      {searchMutation.isPending && (
        <div className="mt-8 text-center">Loading seasons...</div>
      )}

      {searchMutation.isError && (
        <div className="mt-8 text-center text-red-600">
          {searchMutation.error instanceof Error
            ? searchMutation.error.message
            : "An error occurred"}
        </div>
      )}

      {seasons.length > 0 && (
        <div className="w-full">
          <DataTable columns={columns} data={seasons} />
        </div>
      )}
    </div>
  )
}

export default function Home() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center">Loading...</div>}>
      <HomeContent />
    </Suspense>
  )
}
