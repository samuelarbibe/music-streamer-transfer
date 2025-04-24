import { useEffect, useState } from "react"
import { useMutation, UseMutationOptions, useQuery } from "@tanstack/react-query"

import { delay } from "../utils"
import { AddTracksToPlaylistProps, Playlist, ServiceProfile, Track } from "."
import { atom } from 'jotai/vanilla';
import { useAtom } from 'jotai/react';
import axios from "axios";
import Fuse from 'fuse.js'

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
          icon: 'https://lh3.googleusercontent.com/fife/ALs6j_HGOBLGjopuCkPkDZlNyNQgd1eJu6ZCvCwjODcYRYJTVhbAOXoPjGmYYOVVSgvH6UWKYhnBVlYRX3kcceXfOXQ6ny0Gw6vsuTBzCXJZayRDyDRUlnR8HnD-0uz7B-QLXksvifwNzD1vTeC4MBqErB53McuwbuNzKeQ-4ljQKW-uLL-ojelQmxMVSHXVnmVa1gUjDmcPg9Vi9XuQ01ETn03JdgKuvkGA3yiKaX7eATwsbdb8VTWJZ5K8jOg6Wr-hqgRs0NjsOI3gz8HjBMgb04ZvSd8JrSkHQKUcRMUetpgmnsN1yjOBrTECgbSgbftkoAuy3LP6K0Azz9WLgj93XgDb9qxgWCzdilMHj2P3YhKtCD7uE9EGZNrlkPp22_JBuURUSrZRlZGcwH9W0-nNpSursiWUqexRXkNRpBTjhLYw7h2wfdwNXUc-b7HcfRWjRVeKr4raMq8YPx97kKwHYscAgQPGbQejb9HY7Gn-HDrcrT-t4EkIUJKIyzdJTrfiF4NikP1SD5JLSbME_FC7k7zWPQKzp3vpvea5-SqixpZcC0EkvHt2BWnf8QbtDHqJmnyYLhXjPVJwd7I0lP7zKVD3pxcH0gaqRi62s2h_gRKVQL-xbTEchQwD1eSXv6fVaEPmM9j-_yUvjg0aXmArK30oC7AM1GrPr3nU_BNgoyX51ezSBMzgKKKWxRX4FtQyJsz3UK2hMgwCGdpsQsmDJWuWDBiUjJrCGOd8OdpZN2UmqTXgJZlsSySrpIoWK1obSMXHBIWu0esSWb575-sfEF61qhdaRuSRwGN7RxqU-l2AksT2tiuErQj-1LNg2PBa50yr8MtPCMimotImlPatPRZhL6up0joGcrDG2YXHQ4g8syXfM5ob1OdBmHhLjtSaPC4fBKKIUIhlr66SdzPO6XoCDOfbUTGf2qrvEJXgJdDotdOfvSayQ-KyiY3BT3gKs7nQkMt-kFsaASjJ96vim9wGxTRJ2bqgHuRtippy3kER9SY4ziWSIMUoKtETKkDmrexwM4Ds8UVu1aOgJ_8N282tQQQ5lGfB4GP9GFPjB46I8XjMhSOmQ5PVgtX0TVqpAQtc2dih0-w147Gl6O-2ylbk7Ede5aulgdm3vWRRiNNMyd5YJzP5dWtqFFLfI3e7Cc6y3jjga35BzOXvKzrsC8p5_-b32_VztQjz1xBPllqRUHvxokUrHRLX0tmPLSYj1Mb3iSke363r2M_Cnn7SWvkP1sqi6Z0sw6ml1FPKsDgWYUYqM9KGnc8iCcWhIUiTnoVWHaQv3GM7wYIMqAFQPCaBHhM80QNg8TXrdkdoORiTgdGjj8HB_XzcMOGTGF5IHy2_C6xekOsdfDTM38frZDkPMChU326zlPdK-8usV1K6CH-Hm0-Kfh-p6uWd5---XRYxXV3V018qe_Kf5kKjF6KincvWGCyulNYdBxK3Os4vnv1_NcdVCzS9EMpeV1tn1dzMG1KKItyPGYWlFShRyKHMr6s52FIlVasB93xQaSCDqWCSr1phce_5WzoFN8D_DEhmbHeGlB0YVD0bS2HsIXlR-xN_RcKGMGKLKypt9idm2KZYzKpYeNnGvjL54cvKA2V29UU0oxrYewGzIs4YIvwCqit5ugajAjaYZcY4tNBElehvSkEawg=w2475-h1319?auditContext=forDisplay',
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

      const playlists = res.data.data?.map<Playlist>((playlist) => ({
        id: playlist.id,
        name: playlist.attributes?.name ?? "Untitled",
        description: playlist.attributes?.description?.standard ?? "",
        image: playlist.attributes?.artwork?.url ?? "",
      }))

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
    queryKey: ['apple', 'track-ids', tracks?.map((t) => t.id)],
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

        const searchResults = res.data.results?.["songs"]?.data ?? []
        const fuse = new Fuse(searchResults, { keys: ["attributes.artistName", "attributes.name"] })
        const bestResult = fuse.search(searchTerm)

        const appleTrackId = bestResult[0]?.item.id
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