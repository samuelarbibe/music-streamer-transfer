import { useQuery } from "@tanstack/react-query"
import { Playlist, Track, useServiceAccessToken } from "."
import { delay } from "../utils"

interface SpotifyPlaylistResponse {
  id: string
  name: string
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

export const useSpotifyPlaylists = () => {
  const accessToken = useServiceAccessToken("spotify")

  return useQuery<Playlist[]>({
    queryKey: ["spotify", "playlists"],
    queryFn: async () => {
      const res = await fetch(
        "https://api.spotify.com/v1/me/playlists",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const data = await res.json() as SpotifyPlaylistsResponse

      return data.items.map<Playlist>((spotifyPlaylist) => ({
        id: spotifyPlaylist.id,
        name: spotifyPlaylist.name,
        image: spotifyPlaylist.images[0].url,
        trackCount: spotifyPlaylist.tracks.total
      }))
    },
    enabled: !!accessToken
  })
}

export const useSpotifyPlaylistById = (playlistId: string) => {
  const accessToken = useServiceAccessToken("spotify")

  return useQuery<Playlist>({
    queryKey: ["spotify", "playlists", playlistId],
    queryFn: async () => {
      const res = await fetch(
        `https://api.spotify.com/v1/playlists/${playlistId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const data = await res.json() as SpotifyPlaylistResponse

      return {
        id: data.id,
        name: data.name,
        image: data.images[0].url,
        trackCount: data.tracks.total
      }
    },
    enabled: !!accessToken
  })
}

export const useSpotifyPlaylistTracksById = (playlistId: string) => {
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
        const res = await fetch(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks?offset=${skip}&limit=${limit}`,
          { headers: { Authorization: `Bearer ${accessToken}` }, },
        )
        const data = await res.json() as SpotifyPlaylistTracksResponse

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
    enabled: !!accessToken
  })
}
