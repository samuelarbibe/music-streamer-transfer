import { useState } from "react"
import { AccessToken, AuthorizationCodeWithPKCEStrategy, Page, PlaylistedTrack, SearchResults, SpotifyApi, Track as SpotifyTrack } from '@spotify/web-api-ts-sdk';
import { useMutation, UseMutationOptions, useQuery } from "@tanstack/react-query"

import { delay } from "../utils"
import { AddTracksToPlaylistProps, Playlist, ServiceProfile, Track } from "."
import { atom } from 'jotai/vanilla';
import { useAtom, useAtomValue, useSetAtom } from 'jotai/react';
import { atomWithStorage } from "jotai/utils";

export const spotifyAccessTokenAtom = atomWithStorage<AccessToken | undefined>("spotify:accessToken", undefined)

export const spotifyAtom = atom((get) => {
  const accessToken = get(spotifyAccessTokenAtom)
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID as string

  if (!accessToken) return

  return SpotifyApi.withAccessToken(clientId, accessToken)
})

export const useSpotifyProfile = () => {
  const spotify = useAtomValue(spotifyAtom)
  const { data: isAuthenticated } = useIsSpotifyAuthenticated()

  return useQuery<ServiceProfile | null>({
    queryKey: ["spotify", "profile", isAuthenticated],
    queryFn: async () => {
      if (!spotify) return null

      const res = await spotify.currentUser.profile()

      return {
        name: res.display_name,
        imageUrl: res.images[0].url
      }
    },
  })
}

const SPOTIFY_HEALTHCHECK_MS = 5000

export const useIsSpotifyAuthenticated = () => {
  const spotify = useAtomValue(spotifyAtom)
  const signOut = useSpotifySignOut()
  const [spotifyAccessToken] = useAtom(spotifyAccessTokenAtom)

  return useQuery({
    queryKey: ["spotify", "authenticated", !!spotifyAccessToken],
    queryFn: async () => {
      if (!spotify) return false

      const accessToken = await spotify.currentUser.profile().catch(() => null)

      if (!accessToken) {
        signOut()
        return false
      }

      return true
    },
    refetchInterval: SPOTIFY_HEALTHCHECK_MS,
  })
}

const getSpotifyAuthApi = () => {
  const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID as string
  const redirectUrl = process.env.NEXT_PUBLIC_SPOTIFY_CALLBACK_URL as string
  const activeScopes = ["user-read-email", "playlist-read-private", "playlist-modify-public", "playlist-modify-private", "user-library-read user-library-modify"]

  const auth = new AuthorizationCodeWithPKCEStrategy(clientId, redirectUrl, activeScopes);
  const internalSdk = new SpotifyApi(auth);

  return internalSdk
}

export const useSpotifySignIn = () => {
  return async () => {
    const spotifyAuthApi = getSpotifyAuthApi()
    await spotifyAuthApi.authenticate()
  }
}

export const useSpotifySignOut = () => {
  const setSpotifyAccessToken = useSetAtom(spotifyAccessTokenAtom)

  return () => {
    const spotifyAuthApi = getSpotifyAuthApi()
    spotifyAuthApi.logOut()
    setSpotifyAccessToken(undefined)
  }
}

export const useSpotifyPlaylists = (enabled: boolean) => {
  const spotify = useAtomValue(spotifyAtom)

  return useQuery<Playlist[] | undefined>({
    queryKey: ["spotify", "playlists"],
    queryFn: async () => {
      const data = await spotify?.currentUser.playlists.playlists(50)

      return data?.items.map<Playlist>((spotifyPlaylist) => ({
        id: spotifyPlaylist.id,
        name: spotifyPlaylist.name,
        description: spotifyPlaylist.description,
        image: spotifyPlaylist.images[0].url,
        trackCount: spotifyPlaylist.tracks?.total ?? 0
      }))
    },
    enabled: enabled && !!spotify
  })
}

export const useSpotifyPlaylistById = (playlistId?: string) => {
  const spotify = useAtomValue(spotifyAtom)

  return useQuery<Playlist | undefined>({
    queryKey: ["spotify", "playlists", "id", playlistId],
    queryFn: async () => {
      if (!playlistId) return
      const data = await spotify?.playlists.getPlaylist(playlistId)

      if (!data) return

      return {
        id: data.id,
        name: data.name,
        image: data.images[0].url,
        description: data.description,
        trackCount: data.tracks.total
      }
    },
    enabled: !!spotify && !!playlistId
  })
}

export const useSpotifyPlaylistTracksById = (playlistId?: string) => {
  const limit = 50
  const limitDelay = 200
  const spotify = useAtomValue(spotifyAtom)

  return useQuery<Track[] | undefined>({
    queryKey: ["spotify", "playlists", "tracks", playlistId],
    queryFn: async () => {
      if (!playlistId) return

      let skip = 0
      let total = 0
      const result: Track[] = []

      do {
        const data = await spotify?.makeRequest<Page<PlaylistedTrack<SpotifyTrack>>>(
          "GET",
          `playlists/${playlistId}/tracks?offset=${skip}&limit=${limit}`
        )

        if (!data) return

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
    enabled: !!spotify && !!playlistId
  })
}

export const useSpotifyTrackIds = (tracks?: Track[]) => {
  const requestDelay = 100
  const spotify = useAtomValue(spotifyAtom)
  const [progress, setProgress] = useState(0)

  const res = useQuery<string[] | undefined>({
    queryKey: ["spotify", "tracks", tracks?.map((track) => track.id)],
    queryFn: async () => {
      if (!tracks) return

      const result: string[] = []

      for (const track of tracks) {
        const query = `track:${track.name} artist:${track.artists[0]}`

        const url = `search?q=${encodeURIComponent(query)}&type=track&limit=1`
        const data = await spotify?.makeRequest<SearchResults<["track"]>>("GET", url)

        const spotifyTrackId = data?.tracks?.items?.[0]?.id
        if (spotifyTrackId) {
          result.push(spotifyTrackId)
        }

        setProgress((prev) => prev + 1)

        await delay(requestDelay)
      }

      return result
    },
    enabled: !!spotify && !!tracks
  })

  return {
    ...res,
    progress
  }
}

export const useCreateSpotifyPlaylist = (options: Partial<UseMutationOptions<string | undefined, Error, Playlist, unknown>>) => {
  const createDelay = 5000
  const spotify = useAtomValue(spotifyAtom)

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      const profile = await spotify?.currentUser.profile()
      if (!profile) return

      const data = await spotify?.playlists.createPlaylist(profile?.id, {
        name: playlist.name,
        description: "Created by music-streamer-transfer",
        public: false
      })

      await delay(createDelay)

      return data?.id
    },
    ...options
  })
}

export const useAddTracksToSpotifyPlaylist = (options: Partial<UseMutationOptions<string, Error, AddTracksToPlaylistProps, unknown>>) => {
  const [progress, setProgress] = useState(0)
  const spotify = useAtomValue(spotifyAtom)

  const res = useMutation({
    mutationFn: async ({ trackIds, playlistId }: AddTracksToPlaylistProps) => {
      const chunkSize = 100

      for (let i = 0; i < trackIds.length; i += chunkSize) {
        const chunk = trackIds.slice(i, i + chunkSize)
        const uris = chunk.map(id => `spotify:track:${id}`)

        await spotify?.playlists.addItemsToPlaylist(playlistId, uris)

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