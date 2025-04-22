import { useMutation, UseMutationOptions, useQuery } from "@tanstack/react-query"
import { AddTracksToPlaylistProps, Playlist, ServiceProfile, Track } from "."
import { delay, generateOAuthState } from "../utils"
import { useState } from "react";
import axios from 'axios'

import { useAtomValue, useSetAtom } from "jotai/react";
import { atomWithStorage } from "jotai/utils";

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

export const googleAccessTokenAtom = atomWithStorage<string | undefined>("google:accessToken", undefined)
export const googleOauthStateAtom = atomWithStorage<string | undefined>("google:state", undefined)

export const useGoogleSignIn = () => {
  const setOauthState = useSetAtom(googleOauthStateAtom)

  return async () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string;
    const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_CALLBACK_URL as string;
    const scope = "openid email profile https://www.googleapis.com/auth/youtube.force-ssl";

    const state = generateOAuthState();
    setOauthState(state)

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}&state=${encodeURIComponent(state)}`;

    window.location.href = authUrl;
  }
}

export const useGoogleSignOut = () => {
  const setAccessToken = useSetAtom(googleAccessTokenAtom)

  return () => {
    setAccessToken(undefined)
  }
}

const GOOGLE_HEALTHCHECK_MS = 5000

export const useIsGoogleAuthenticated = () => {
  const accessToken = useAtomValue(googleAccessTokenAtom)

  return useQuery({
    queryKey: ["google", "authenticated", accessToken],
    queryFn: async () => {
      if (!accessToken) return false

      const res = await fetch(`https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${accessToken}`);
      return res.ok;
    },
    refetchInterval: GOOGLE_HEALTHCHECK_MS,
  })
}


export const useGoogleProfile = () => {
  const accessToken = useAtomValue(googleAccessTokenAtom)

  return useQuery<ServiceProfile | null>({
    queryKey: ["google", "profile", accessToken],
    queryFn: async () => {
      if (!accessToken) return null

      const { data } = await axios.get(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (!data) return null

      return {
        name: data.name as string,
        imageUrl: data.picture as string
      }
    },
  })
}

export const useGooglePlaylistById = (playlistId?: string) => {
  const accessToken = useAtomValue(googleAccessTokenAtom)

  return useQuery<Playlist>({
    queryKey: ["google", "playlists", "id", playlistId],
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
  const accessToken = useAtomValue(googleAccessTokenAtom)
  const [progress, setProgress] = useState(0)

  const res = useQuery<string[]>({
    queryKey: ["google", "tracks", tracks?.map((track) => track.id)],
    queryFn: async () => {
      if (!tracks) return []

      const result: string[] = []

      // TODO: remove slice
      for (const track of tracks) {
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
  const accessToken = useAtomValue(googleAccessTokenAtom)

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

export const useCreateGooglePlaylist = (options: Partial<UseMutationOptions<string | undefined, Error, Playlist, unknown>>) => {
  const accessToken = useAtomValue(googleAccessTokenAtom)

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
    },
    ...options
  })
}

export const useAddTracksToGooglePlaylist = (options: Partial<UseMutationOptions<string, Error, AddTracksToPlaylistProps, unknown>>) => {
  const [progress, setProgress] = useState(0)
  const accessToken = useAtomValue(googleAccessTokenAtom)

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
    },
    ...options
  })

  return {
    ...res,
    progress
  }
}

type GooglePlaylistListItem = {
  snippet: {
    title: string
    resourceId: {
      videoId: string
    }
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
  const accessToken = useAtomValue(googleAccessTokenAtom)

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
          id: item.snippet.resourceId.videoId,
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