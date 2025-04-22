import { useCallback, useEffect, useState } from "react"
import { AuthorizationCodeWithPKCEStrategy, Page, PlaylistedTrack, SearchResults, SpotifyApi, Track as SpotifyTrack } from '@spotify/web-api-ts-sdk';
import { useMutation, UseMutationOptions, useQuery, useQueryClient } from "@tanstack/react-query"

import { delay } from "../utils"
import { AddTracksToPlaylistProps, Playlist, ServiceProfile, Track } from "."
import { atom } from 'jotai/vanilla';
import { useAtom, useSetAtom } from 'jotai/react';
import { useSearchParams } from 'next/navigation';

const spotifyAtom = atom<SpotifyApi>()

export const useSpotifyProfile = () => {
  const [spotify] = useAtom(spotifyAtom)
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
  const [spotify] = useAtom(spotifyAtom)

  return useQuery({
    queryKey: ["spotify", "authenticated"],
    queryFn: async () => {
      const accessToken = await spotify?.getAccessToken()
      return !!accessToken
    },
    refetchInterval: SPOTIFY_HEALTHCHECK_MS,
  })
}

export const useSpotifySignIn = () => {
  const searchParams = useSearchParams()
  const shouldAuthorizeCode = !!searchParams.get("code")
  const setSpotify = useSetAtom(spotifyAtom)
  const queryClient = useQueryClient()

  const performAuthentication = useCallback(async () => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID as string
    const redirectUrl = process.env.NEXT_PUBLIC_SPOTIFY_CALLBACK_URL as string
    const activeScopes = ["user-read-email", "playlist-read-private", "playlist-modify-public", "playlist-modify-private", "user-library-read user-library-modify"]

    const auth = new AuthorizationCodeWithPKCEStrategy(clientId, redirectUrl, activeScopes);
    const internalSdk = new SpotifyApi(auth);

    try {
      const { authenticated, accessToken } = await internalSdk.authenticate();

      if (authenticated) {
        setSpotify(() => SpotifyApi.withAccessToken(clientId, accessToken));
        queryClient.setQueryData(["spotify", "authenticated"], () => true)
      }
    } catch (e: Error | unknown) {
      const error = e as Error;

      if (error && error.message && error.message.includes("No verifier found in cache")) {
        console.error("If you are seeing this error in a React Development Environment it's because React calls useEffect twice. Using the Spotify SDK performs a token exchange that is only valid once, so React re-rendering this component will result in a second, failed authentication. This will not impact your production applications (or anything running outside of Strict Mode - which is designed for debugging components).", error);
      } else {
        console.error(e);
      }
    }
  }, [queryClient, setSpotify])

  useEffect(() => {
    if (!shouldAuthorizeCode) return

    performAuthentication()
  }, [performAuthentication, shouldAuthorizeCode])

  return () => {
    performAuthentication()
  }
}

export const useSpotifySignOut = () => {
  const [spotify, setSpotify] = useAtom(spotifyAtom)
  const queryClient = useQueryClient()

  return () => {
    spotify?.logOut()
    setSpotify(undefined)
    queryClient.setQueryData(["spotify", "authenticated"], () => false)
  }
}

export const useSpotifyPlaylists = (enabled: boolean) => {
  const [spotify] = useAtom(spotifyAtom)

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
  const [spotify] = useAtom(spotifyAtom)

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
  const [spotify] = useAtom(spotifyAtom)

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
  const [spotify] = useAtom(spotifyAtom)
  const [progress, setProgress] = useState(0)

  const res = useQuery<string[] | undefined>({
    queryKey: ["spotify", "tracks", tracks?.map((track) => track.id)],
    queryFn: async () => {
      if (!tracks) return

      const result: string[] = []

      // TODO: remove slice
      for (const track of tracks) {
        const query = `${track.name} ${track.artists[0]}`

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
  const [spotify] = useAtom(spotifyAtom)

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      const profile = await spotify?.currentUser.profile()
      if (!profile) return

      const data = await spotify?.playlists.createPlaylist(profile?.id, {
        name: playlist.name,
        description: "Created by music-streamer-transfer",
        public: false
      })

      return data?.id
    },
    ...options
  })
}

export const useAddTracksToSpotifyPlaylist = (options: Partial<UseMutationOptions<string, Error, AddTracksToPlaylistProps, unknown>>) => {
  const [progress, setProgress] = useState(0)
  const [spotify] = useAtom(spotifyAtom)

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