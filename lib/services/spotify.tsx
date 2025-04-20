import { useMutation, UseMutationOptions, useQuery } from "@tanstack/react-query"
import { AddTracksToPlaylistProps, Playlist, Track, useServiceAccessToken } from "."
import { delay } from "../utils"
import { useState } from "react"
import axios from 'axios'

interface SpotifyPlaylistResponse {
  id: string
  name: string
  description: string
  images: {
    url: string
    height: number
    width: number
  }[]
  tracks: {
    href: string
    total: number
  }
}

interface SpotifyPlaylistsResponse {
  items: SpotifyPlaylistResponse[]
}

interface PlaylistTrackObject {
  track: {
    id: string,
    artists: {
      name: string
    }[]
    name: string
  }
}

interface SpotifyPlaylistTracksResponse {
  total: number
  offset: number
  items: PlaylistTrackObject[]
}

export const useSpotifyPlaylists = (enabled: boolean) => {
  const accessToken = useServiceAccessToken("spotify")

  return useQuery<Playlist[]>({
    queryKey: ["spotify", "playlists"],
    queryFn: async () => {
      const { data } = await axios.get<SpotifyPlaylistsResponse>(
        "https://api.spotify.com/v1/me/playlists",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      return data.items.map<Playlist>((spotifyPlaylist) => ({
        id: spotifyPlaylist.id,
        name: spotifyPlaylist.name,
        description: spotifyPlaylist.description,
        image: spotifyPlaylist.images[0].url,
        trackCount: spotifyPlaylist.tracks.total
      }))
    },
    enabled: !!accessToken && !!enabled
  })
}

export const useSpotifyPlaylistById = (playlistId?: string) => {
  const accessToken = useServiceAccessToken("spotify")

  return useQuery<Playlist>({
    queryKey: ["spotify", "playlists", "id", playlistId],
    queryFn: async () => {
      const { data } = await axios.get<SpotifyPlaylistResponse>(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      return {
        id: data.id,
        name: data.name,
        image: data.images[0].url,
        description: data.description,
        trackCount: data.tracks.total
      }
    },
    enabled: !!accessToken && !!playlistId
  })
}

export const useSpotifyPlaylistTracksById = (playlistId?: string) => {
  const limit = 50
  const limitDelay = 200
  const accessToken = useServiceAccessToken("spotify")

  return useQuery<Track[]>({
    queryKey: ["spotify", "playlists", "tracks", playlistId],
    queryFn: async () => {
      let skip = 0
      let total = 0
      const result: Track[] = []

      do {
        const { data } = await axios.get<SpotifyPlaylistTracksResponse>(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${skip}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${accessToken}` }, },
        )

        total = data.total
        skip = data.offset + limit

        const tracks = data.items.map<Track>((item) => ({
          id: item.track.id,
          name: item.track.name,
          artists: item.track.artists.map((artist) => artist.name)
        }))

        result.push(...tracks)

        await delay(limitDelay)
      } while (skip < total)

      return result
    },
    enabled: !!accessToken && !!playlistId
  })
}

export const useSpotifyTrackIds = (tracks?: Track[]) => {
  const requestDelay = 100
  const accessToken = useServiceAccessToken("spotify")
  const [progress, setProgress] = useState(0)

  const res = useQuery<string[]>({
    queryKey: ["spotify", "tracks", tracks?.map((track) => track.id)],
    queryFn: async () => {
      if (!tracks) return []

      const result: string[] = []

      // TODO: remove slice
      for (const track of tracks.slice(0, 1)) {
        const query = `${track.name} ${track.artists[0]}`
        const { data } = await axios.get(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=1`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        const spotifyTrackId = data.tracks?.items?.[0]?.id
        if (spotifyTrackId) {
          result.push(spotifyTrackId)
        }

        setProgress((prev) => prev + 1)

        await delay(requestDelay)
      }

      return result
    },
    enabled: !!accessToken && !!tracks
  })

  return {
    ...res,
    progress
  }
}

export const useCreateSpotifyPlaylist = (options: Partial<UseMutationOptions<string, Error, Playlist, unknown>>) => {
  const accessToken = useServiceAccessToken("spotify")

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      const { data: user } = await axios.get("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${accessToken}` }
      })

      const { data } = await axios.post(
        `https://api.spotify.com/v1/users/${user.id}/playlists`,
        {
          name: playlist.name,
          description: "Created by music-streamer-transfer",
          public: false
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` }
        }
      )

      return data.id as string
    },
    ...options
  })
}

export const useAddTracksToSpotifyPlaylist = (options: Partial<UseMutationOptions<string, Error, AddTracksToPlaylistProps, unknown>>) => {
  const [progress, setProgress] = useState(0)
  const accessToken = useServiceAccessToken("spotify")

  const res = useMutation({
    mutationFn: async ({ trackIds, playlistId }: AddTracksToPlaylistProps) => {
      const chunkSize = 100

      for (let i = 0; i < trackIds.length; i += chunkSize) {
        const chunk = trackIds.slice(i, i + chunkSize)
        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          { uris: chunk.map(id => `spotify:track:${id}`) },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        setProgress((prev) => prev + chunk.length)

        await delay(200)
      }

      return playlistId
    },
    ...options
  })

  return {
    ...res,
    progress
  }
}