"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useMutation } from "@tanstack/react-query"
import { ColumnDef } from "@tanstack/react-table"
import { Input } from "@/components/ui/input"
import { DataTable } from "@repo/ui/data-table"
import { searchArtist, getArtistAlbumsWithTracks } from "@/services/spotify"
import { useSpotifyStore } from "@/store/spotify-store"
import type { AlbumWithTracks } from "@/types/spotify"
import Image from "next/image"

const columns: ColumnDef<AlbumWithTracks>[] = [
  {
    accessorKey: "name",
    header: "Album Name",
    size: 400,
    cell: ({ row }) => {
      const album = row.original
      return (
        <div className="flex items-center gap-2">
          {album.images[0] && (
            <Image
              src={album.images[0].url}
              alt={album.name}
              width={60}
              height={60}
              className="rounded"
            />
          )}
          <a
            href={album.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline"
          >
            {album.name}
          </a>
        </div>
      )
    },
  },
  {
    accessorKey: "release_date",
    header: "Release Date",
    size: 130,
  },
  {
    accessorKey: "album_type",
    header: "Type",
    size: 100,
    cell: ({ row }) => {
      const type = row.getValue("album_type") as string
      return type.charAt(0).toUpperCase() + type.slice(1)
    },
  },
  {
    accessorKey: "total_tracks",
    header: "Tracks",
    size: 100,
  },
  {
    accessorKey: "averagePopularity",
    header: "Avg Popularity",
    size: 150,
    cell: ({ row }) => {
      const popularity = row.getValue("averagePopularity") as number
      return popularity ? popularity.toFixed(1) : "0"
    },
  },
]

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { artistInfo, albums, setArtistInfo, setAlbums } = useSpotifyStore()
  const [searchInput, setSearchInput] = useState("")

  const searchMutation = useMutation({
    mutationFn: async (artistName: string) => {
      const artist = await searchArtist(artistName)
      setArtistInfo(artist)

      const albumsWithTracks = await getArtistAlbumsWithTracks(artistName)
      setAlbums(albumsWithTracks)
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
          albums.length > 0 ? "mb-4" : ""
        }`}
      >
        <div className={`flex w-full items-center gap-4 ${albums.length > 0 ? "flex-row" : "flex-col"}`}>
          <Input
            className={`h-10 ${albums.length === 0 ? "max-w-md" : "flex-1"}`}
            placeholder="Search for an artist (e.g., Taylor Swift)"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
        </div>

        {artistInfo && (
          <a
            href={artistInfo.external_urls.spotify}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-4"
          >
            {artistInfo.images[0] && (
              <Image
                src={artistInfo.images[0].url}
                alt={artistInfo.name}
                width={100}
                height={100}
                className="rounded-full"
              />
            )}
            <div>
              <h2 className="text-2xl font-bold">{artistInfo.name}</h2>
              <p className="text-gray-600">
                Popularity: {artistInfo.popularity} | Followers: {artistInfo.followers.total.toLocaleString()}
              </p>
            </div>
          </a>
        )}
      </div>

      {searchMutation.isPending && (
        <div className="mt-8 text-center">Loading albums and tracks...</div>
      )}

      {searchMutation.isError && (
        <div className="mt-8 text-center text-red-600">
          {searchMutation.error instanceof Error
            ? searchMutation.error.message
            : "An error occurred"}
        </div>
      )}

      {albums.length > 0 && (
        <div className="w-full">
          <DataTable columns={columns} data={albums} />
        </div>
      )}
    </div>
  )
}
