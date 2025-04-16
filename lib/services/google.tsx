import { useMutation, useQuery } from "@tanstack/react-query"
import { AddTracksToPlaylistProps, Playlist, Track, useServiceAccessToken } from "."
import { delay } from "../utils"
import { useState } from "react";
import axios from 'axios'

type GooglePlaylist = {
  id: string
  snippet: {
    title: string
    description: string
    thumbnails: {
      default: {
        url: string
        width: number
        height: number
      }
    }
  }
  contentDetails: {
    itemCount: number
  }
}

interface GooglePlaylistsResponse {
  items: GooglePlaylist[]
}

export const useGooglePlaylistById = (playlistId?: string) => {
  const accessToken = useServiceAccessToken("google")

  return useQuery<Playlist>({
    queryKey: ["google", "playlists", playlistId],
    queryFn: async () => {
      const { data } = await axios.get<GooglePlaylistsResponse>(
        `https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&id=${playlistId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      const playlist = data.items[0]

      return {
        id: playlist.id,
        name: playlist.snippet.title,
        description: playlist.snippet.description,
        image: playlist.snippet.thumbnails.default.url,
        trackCount: playlist.contentDetails.itemCount
      }
    },
    enabled: !!accessToken && !!playlistId
  })
}

export const useGoogleTrackIds = (tracks?: Track[]) => {
  const requestDelay = 100
  const accessToken = useServiceAccessToken("google")
  const [progress, setProgress] = useState(0)

  const res = useQuery<string[]>({
    queryKey: ["google", "tracks", tracks],
    queryFn: async () => {
      if (!tracks) return []

      const result: string[] = []

      // TODO: remove slice
      for (const track of tracks.slice(0, 1)) {
        const { data } = await axios.get(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(`${track.name} ${track.artists[0]}`)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        const videoId = data.items?.[0].id?.videoId
        if (videoId) {
          result.push(videoId)
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

export const useGooglePlaylists = (enabled: boolean) => {
  const accessToken = useServiceAccessToken("google")

  return useQuery<Playlist[]>({
    queryKey: ["google", "playlists"],
    queryFn: async () => {
      const { data } = await axios.get<GooglePlaylistsResponse>(
        "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )

      return data.items.map<Playlist>((googlePlaylist) => ({
        id: googlePlaylist.id,
        name: googlePlaylist.snippet.title,
        description: googlePlaylist.snippet.description,
        image: googlePlaylist.snippet.thumbnails.default.url,
        trackCount: googlePlaylist.contentDetails.itemCount
      }))
    },
    enabled: !!accessToken && !!enabled
  })
}

export const useCreateGooglePlaylist = () => {
  const accessToken = useServiceAccessToken("google")

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      const { data } = await axios.post('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status',
        {
          snippet: {
            title: playlist.name,
            description: playlist.description
          },
          status: {
            privacyStatus: 'private'
          }
        },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      return data.id as string
    }
  })
}

export const useAddTracksToGooglePlaylist = () => {
  const [progress, setProgress] = useState(0)
  const accessToken = useServiceAccessToken("google")

  const res = useMutation({
    mutationFn: async ({ trackIds, playlistId }: AddTracksToPlaylistProps) => {
      for (const videoId of trackIds) {
        await axios.post('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet',
          {
            snippet: {
              playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId
              }
            }
          },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        setProgress((prev) => prev + 1)
      }
      return playlistId;
    }
  })

  return {
    ...res,
    progress
  }
}

type GooglePlaylistListItem = {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    description: string
  }
}

interface GooglePlaylistListResponse {
  items: GooglePlaylistListItem[]
  nextPageToken: string
}

export const useGooglePlaylistTracksById = (playlistId?: string) => {
  const limit = 50
  const limitDelay = 200
  const accessToken = useServiceAccessToken("google")

  return useQuery<Track[]>({
    queryKey: ["google", "playlists", "tracks", playlistId],
    queryFn: async () => {
      const result: Track[] = []
      let nextPageToken: string | undefined = undefined

      do {
        let url = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${limit}&playlistId=${playlistId}`
        if (nextPageToken) {
          url = url.concat(`&pageToken=${nextPageToken}`)
        }

        const { data } = await axios.get<GooglePlaylistListResponse>(
          url,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )

        const tracks = data.items.map<Track>((item) => ({
          id: item.id.videoId,
          name: item.snippet.title,
          artists: [item.snippet.title]
        }))
        result.push(...tracks)

        nextPageToken = data.nextPageToken
        await delay(limitDelay)
      } while (nextPageToken)

      return result
    },
    enabled: !!accessToken && !!playlistId
  })
}