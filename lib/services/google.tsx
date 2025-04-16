import { useMutation, useQuery } from "@tanstack/react-query"
import { AddTracksToPlaylistProps, Playlist, Track, useServiceAccessToken } from "."
import { delay } from "../utils"
import { useState } from "react";

export const useGoogleTrackIds = (tracks: Track[]) => {
  const requestDelay = 100
  const accessToken = useServiceAccessToken("google")
  const [progress, setProgress] = useState(0)

  const res = useQuery<string[]>({
    queryKey: ["google", "tracks", tracks],
    queryFn: async () => {
      const result: string[] = []

      // TODO: remove slice
      for (const track of tracks.slice(0, 1)) {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=1&type=video&q=${encodeURIComponent(`${track.name} ${track.artists[0]}`)}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const data = await res.json()

        const videoId = data.items?.[0].id?.videoId
        if (videoId) {
          result.push(videoId)
        }

        await delay(requestDelay)
        setProgress((prev) => prev + 1)
      }

      return result
    },
    enabled: !!accessToken
  })

  return {
    ...res,
    progress
  }
}

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

export const useGooglePlaylists = () => {
  const accessToken = useServiceAccessToken("google")

  return useQuery<Playlist[]>({
    queryKey: ["google", "playlists"],
    queryFn: async () => {
      const res = await fetch(
        "https://www.googleapis.com/youtube/v3/playlists?part=snippet,contentDetails&mine=true&maxResults=50",
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const data = await res.json() as GooglePlaylistsResponse

      return data.items.map<Playlist>((googlePlaylist) => ({
        id: googlePlaylist.id,
        name: googlePlaylist.snippet.title,
        image: googlePlaylist.snippet.thumbnails.default.url,
        trackCount: googlePlaylist.contentDetails.itemCount
      }))
    },
    enabled: !!accessToken
  })
}

export const useCreateGooglePlaylist = () => {
  const accessToken = useServiceAccessToken("google")

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      const res = await fetch('https://www.googleapis.com/youtube/v3/playlists?part=snippet,status', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          snippet: {
            title: playlist.name,
            description: "Created by music-streamer-transfer"
          },
          status: {
            privacyStatus: 'private'
          }
        })
      });

      const data = await res.json();

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
        await fetch('https://www.googleapis.com/youtube/v3/playlistItems?part=snippet', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            snippet: {
              playlistId,
              resourceId: {
                kind: 'youtube#video',
                videoId
              }
            }
          })
        });

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

type GooglePlaylistListResponse = {
  items: GooglePlaylistListItem[]
  nextPageToken: string
}

export const useGooglePlaylistTracksById = (playlistId: string) => {
  const limit = 50
  const limitDelay = 200
  const accessToken = useServiceAccessToken("google")

  return useQuery<Track[]>({
    queryKey: ["google", "playlists", "tracks", playlistId],
    queryFn: async () => {
      const result: Track[] = []
      let nextPageToken: string | undefined = undefined

      do {
        const res = await fetch(
          `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&maxResults=${limit}&playlistId=${playlistId}` +
          (nextPageToken ? `&pageToken=${nextPageToken}` : ''),
          {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          }
        )

        const data = await res.json() as GooglePlaylistListResponse

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
    enabled: !!accessToken
  })
}