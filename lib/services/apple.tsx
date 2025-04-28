"use client"

import { useEffect, useState } from "react"
import { useMutation, UseMutationOptions, useQuery } from "@tanstack/react-query"

import { delay } from "../utils"
import { AddTracksToPlaylistProps, Playlist, ServiceProfile, Track } from "."
import { atom } from 'jotai/vanilla';
import { useAtom } from 'jotai/react';
import axios from "axios";

export const appleAtom = atom<MusicKit.MusicKitInstance>()

export const useAppleProfile = () => {
  const { data: isAuthenticated } = useIsAppleAuthenticated()

  return useQuery<ServiceProfile | null>({
    queryKey: ["apple", "profile", isAuthenticated],
    queryFn: async () => {
      if (!isAuthenticated) return null

      return {
        name: "Apple Music User",
        imageUrl: ""
      }
    },
  })
}

const APPLE_HEALTHCHECK_MS = 5000

export const useIsAppleAuthenticated = () => {
  const appleMusic = useAppleMusic()

  return useQuery({
    queryKey: ["apple", "authenticated", !!appleMusic?.isAuthorized],
    queryFn: () => {
      return !!appleMusic?.isAuthorized
    },
    refetchInterval: APPLE_HEALTHCHECK_MS,
  })
}

const useAppleMusic = () => {
  const [apple, setApple] = useAtom(appleAtom)

  useEffect(() => {
    if (apple) return

    const loadMusicKit = async () => {
      await new Promise<void>((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://js-cdn.music.apple.com/musickit/v3/musickit.js'
        script.async = true
        script.onload = () => resolve()
        document.body.appendChild(script)
      })

      const instance = await window.MusicKit.configure({
        developerToken: process.env.NEXT_PUBLIC_APPLE_DEVELOPER_KEY!,
        app: {
          name: 'Music Streamer Transfer',
          build: '1.0.0',
        },
      })

      setApple(() => instance)
    }

    loadMusicKit()
  }, [apple, setApple])

  return apple
}

export const useAppleSignIn = () => {
  const appleMusic = useAppleMusic()

  return async () => {
    await appleMusic?.authorize()
  }
}

export const useAppleSignOut = () => {
  const appleMusic = useAppleMusic()

  return () => {
    appleMusic?.unauthorize()
  }
}

export const useApplePlaylists = (enabled: boolean) => {
  const appleMusic = useAppleMusic()

  return useQuery<Playlist[] | undefined>({
    queryKey: ["apple", "playlists", !!appleMusic],
    queryFn: async () => {
      const res = await appleMusic?.api.music("/v1/me/library/playlists") as MusicKit.LibraryPlaylistsResponse

      const playlists = res.data.data
        ?.map<Playlist>((playlist) => ({
          id: playlist.id,
          name: playlist.attributes?.name ?? "Untitled",
          description: playlist.attributes?.description?.standard ?? "",
          image: playlist.attributes?.artwork?.url ?? "",
        }))
        .filter((playlist) => playlist.name !== "Favourite Songs")

      return playlists
    },
    enabled: enabled && !!appleMusic
  })
}

export const useApplePlaylistById = (playlistId?: string) => {
  const appleMusic = useAppleMusic()

  return useQuery<Playlist | undefined>({
    queryKey: ["apple", "playlists", "id", playlistId],
    queryFn: async () => {
      if (!playlistId) return

      const res = await appleMusic?.api.music(`/v1/me/library/playlists/${playlistId}`, { include: ["tracks"] }) as MusicKit.LibraryPlaylistsResponse

      return {
        id: res.data.data[0].id,
        name: res.data.data[0].attributes?.name ?? "",
        image: res.data.data[0].attributes?.artwork?.url ?? "",
        description: res.data.data[0].attributes?.description?.standard
      }
    },
    enabled: !!appleMusic && !!playlistId
  })
}

export const useApplePlaylistTracksById = (playlistId?: string) => {
  const limitDelay = 200
  const appleMusic = useAppleMusic()

  return useQuery<Track[] | undefined>({
    queryKey: ["apple", "playlists", "tracks", playlistId],
    queryFn: async () => {
      if (!playlistId || !appleMusic) return

      let tracks: MusicKit.Songs[] = []
      let next

      try {
        const { data } = await appleMusic.api.music(`/v1/me/library/playlists/${playlistId}/tracks`, { limit: 100 }) as { data: MusicKit.Relationship<MusicKit.Songs> }
        tracks = data.data
        next = data.next
      } catch (error) {
        if (!(error instanceof Error) || !error.message.includes("404")) {
          throw error
        }
      }

      while (next) {
        await delay(limitDelay)

        const { data: nextData } = await appleMusic.api.music(next) as { data: MusicKit.Relationship<MusicKit.Songs> }
        const moreTracks = nextData.data ?? []
        tracks = tracks.concat(moreTracks)
        next = nextData.next
      }

      return tracks.map<Track>((item) => ({
        id: item.attributes?.playParams?.catalogId ?? "",
        name: item.attributes?.name ?? '',
        artists: [item.attributes?.artistName ?? ''],
      }))
    },
    enabled: !!appleMusic && !!playlistId
  })
}

export const useAppleTrackIds = (tracks?: Track[]) => {
  const requestDelay = 100
  const [progress, setProgress] = useState(0)
  const appleMusic = useAppleMusic()

  const res = useQuery<string[] | undefined>({
    queryKey: ['apple', 'tracks', tracks?.map((t) => t.id)],
    queryFn: async () => {
      if (!tracks || !appleMusic) return

      const result: string[] = []

      for (const track of tracks) {
        const searchTerm = `${track.name} ${track.artists[0]}`
        const url = `/v1/catalog/${appleMusic.storefrontId}/search`
        const queryParams = {
          term: searchTerm,
          limit: 5,
          types: ["songs"]
        }
        const res = await appleMusic.api.music(url, queryParams) as MusicKit.SearchResponse<MusicKit.Songs>

        const appleTrackId = res.data.results?.["songs"]?.data[0].id
        if (appleTrackId) {
          result.push(appleTrackId)
        }

        setProgress((prev) => prev + 1)
        await delay(requestDelay)
      }

      return result
    },
    enabled: !!tracks?.length && !!appleMusic
  })

  return { ...res, progress }
}

export const useCreateApplePlaylist = (options: Partial<UseMutationOptions<string | undefined, Error, Playlist, unknown>>) => {
  const appleMusic = useAppleMusic()

  return useMutation({
    mutationFn: async (playlist: Playlist) => {
      const res = await axios.post<MusicKit.LibraryPlaylistsResponse['data']>(
        `https://api.music.apple.com/v1/me/library/playlists`,
        {
          attributes: {
            name: playlist.name,
            description: playlist.description
          },
        },
        {
          headers: {
            Authorization: `Bearer ${appleMusic?.developerToken}`,
            'Music-User-Token': appleMusic?.musicUserToken,
            'Content-Type': 'application/json'
          }
        }
      )

      await delay(5000)

      return res.data.data[0].id
    },
    ...options
  })
}

export const useAddTracksToApplePlaylist = (options: Partial<UseMutationOptions<string, Error, AddTracksToPlaylistProps, unknown>>) => {
  const [progress, setProgress] = useState(0)
  const appleMusic = useAppleMusic()

  const res = useMutation({
    mutationFn: async ({ trackIds, playlistId }: AddTracksToPlaylistProps) => {
      const chunkSize = 100

      for (let i = 0; i < trackIds.length; i += chunkSize) {
        const chunk = trackIds.slice(i, i + chunkSize)

        await axios.post(
          `https://api.music.apple.com/v1/me/library/playlists/${playlistId}/tracks`,
          {
            data: chunk.map((trackId) => ({
              id: trackId,
              type: "song"
            }))
          },
          {
            headers: {
              Authorization: `Bearer ${appleMusic?.developerToken}`,
              'Music-User-Token': appleMusic?.musicUserToken,
              'Content-Type': 'application/json'
            }
          }
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