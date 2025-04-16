import AppleMusicIcon from "@/assets/icons/apple.svg";
import SpotifyIcon from "@/assets/icons/spotify.svg";
import YoutubeIcon from "@/assets/icons/youtube.svg";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { SVGElementType } from "react";
import { useSpotifyPlaylistById, useSpotifyPlaylists, useSpotifyPlaylistTracksById } from "./spotify";
import { Session } from "next-auth";
import { useAtom } from "jotai/react";
import { useAddTracksToGooglePlaylist, useCreateGooglePlaylist, useGooglePlaylists, useGooglePlaylistTracksById, useGoogleTrackIds } from "./google";

export const sourcePlaylistsIdsAtom = atom<Set<string>>(new Set<string>());

export const sourceServiceIdAtom = atomWithStorage<ServiceId | null>(
  "sourceServiceId",
  null
);
export const targetServiceIdAtom = atomWithStorage<ServiceId | null>(
  "targetServiceId",
  null
);
export const serviceSessionsAtom = atomWithStorage<Record<ServiceId, Session | null>>(
  "serviceSessions",
  {
    apple: null,
    spotify: null,
    google: null
  }
)

export type ServiceId = "apple" | "spotify" | "google";

export type Track = {
  id: string
  name: string
  artists: string[]
}

export type Playlist = {
  id: string
  name: string,
  image: string,
  trackCount: number
}

export type Service = {
  name: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: SVGElementType;
};

export const services: Record<ServiceId, Service> = {
  apple: {
    name: "Apple Music",
    bgColor: "apple",
    textColor: "apple",
    borderColor: "apple",
    icon: AppleMusicIcon,
  },
  spotify: {
    name: "Spotify",
    bgColor: "spotify",
    textColor: "spotify",
    borderColor: "spotify",
    icon: SpotifyIcon,
  },
  google: {
    name: "Youtube Music",
    bgColor: "youtube",
    textColor: "youtube",
    borderColor: "youtube",
    icon: YoutubeIcon,
  },
};

export const useServiceUser = (serviceId: ServiceId | null) => {
  const [sessions] = useAtom(serviceSessionsAtom);

  return (serviceId && sessions[serviceId]?.user) ?? null;
}

export const useServiceAccessToken = (serviceId: ServiceId | null) => {
  const [sessions] = useAtom(serviceSessionsAtom);

  return (serviceId && sessions[serviceId]?.accessToken) ?? null;
};

export const useIsAccessTokenExpired = (serviceId: ServiceId | null) => {
  const [sessions] = useAtom(serviceSessionsAtom);

  const expiresAt = serviceId && sessions[serviceId]?.expires

  return !!(expiresAt && new Date(expiresAt) < new Date());
};

export const usePlaylists = (serviceId: ServiceId) => {
  const responses: Record<ServiceId, UseQueryResult<Playlist[]>> = {
    spotify: useSpotifyPlaylists(),
    apple: useSpotifyPlaylists(),
    google: useGooglePlaylists()
  }

  return responses[serviceId]
}

export const usePlaylistById = (
  playlistId: string,
  serviceId: ServiceId,
) => {
  const responses: Record<ServiceId, UseQueryResult<Playlist>> = {
    spotify: useSpotifyPlaylistById(playlistId),
    google: useSpotifyPlaylistById(playlistId),
    apple: useSpotifyPlaylistById(playlistId)
  }

  return responses[serviceId]
};

export const usePlaylistTracksById = (
  playlistId: string,
  serviceId: ServiceId,
) => {
  const responses: Record<ServiceId, UseQueryResult<Track[]>> = {
    spotify: useSpotifyPlaylistTracksById(playlistId),
    google: useGooglePlaylistTracksById(playlistId),
    apple: useSpotifyPlaylistTracksById(playlistId)
  }

  return responses[serviceId]
};

export const useTrackIds = (
  tracks: Track[],
  serviceId: ServiceId,
) => {
  const responses: Record<ServiceId, UseQueryResult<string[]> & { progress: number }> = {
    spotify: useGoogleTrackIds(tracks),
    google: useGoogleTrackIds(tracks),
    apple: useGoogleTrackIds(tracks)
  }

  return responses[serviceId]
}

export const useCreatePlaylist = (
  serviceId: ServiceId,
) => {
  const responses: Record<ServiceId, UseMutationResult<string, Error, Playlist, unknown>> = {
    spotify: useCreateGooglePlaylist(),
    google: useCreateGooglePlaylist(),
    apple: useCreateGooglePlaylist()
  }

  return responses[serviceId]
}


export interface AddTracksToPlaylistProps { trackIds: string[], playlistId: string }
type AddTracksToPlaylistResult = UseMutationResult<string, Error, AddTracksToPlaylistProps, unknown> & { progress: number }

export const useAddTracksToPlaylist = (
  serviceId: ServiceId,
) => {
  const responses: Record<ServiceId, AddTracksToPlaylistResult> = {
    spotify: useAddTracksToGooglePlaylist(),
    google: useAddTracksToGooglePlaylist(),
    apple: useAddTracksToGooglePlaylist()
  }

  return responses[serviceId]
}

