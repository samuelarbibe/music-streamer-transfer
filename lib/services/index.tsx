import SpotifyIcon from "@/assets/icons/spotify.svg";
import YoutubeIcon from "@/assets/icons/youtube.svg";
import { UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { SVGElementType } from "react";
import { useAddTracksToSpotifyPlaylist, useCreateSpotifyPlaylist, useSpotifyPlaylistById, useSpotifyPlaylists, useSpotifyPlaylistTracksById, useSpotifyTrackIds } from "./spotify";
import { Session } from "next-auth";
import { useAtom } from "jotai/react";
import { useAddTracksToGooglePlaylist, useCreateGooglePlaylist, useGooglePlaylistById, useGooglePlaylists, useGooglePlaylistTracksById, useGoogleTrackIds } from "./google";

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
    spotify: null,
    google: null
  }
)

export type ServiceId = "spotify" | "google";

export type Track = {
  id: string
  name: string
  artists: string[]
}

export type Playlist = {
  id: string
  name: string,
  description: string,
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
    spotify: useSpotifyPlaylists(serviceId === "spotify"),
    google: useGooglePlaylists(serviceId === "google")
  }

  return responses[serviceId]
}

export const usePlaylistById = (
  serviceId: ServiceId,
  playlistId?: string,
) => {
  const responses: Record<ServiceId, UseQueryResult<Playlist>> = {
    spotify: useSpotifyPlaylistById(serviceId === "spotify" ? playlistId : undefined),
    google: useGooglePlaylistById(serviceId === "google" ? playlistId : undefined),
  }

  return responses[serviceId]
};

export const usePlaylistTracksById = (
  serviceId: ServiceId,
  playlistId?: string,
) => {
  const responses: Record<ServiceId, UseQueryResult<Track[]>> = {
    spotify: useSpotifyPlaylistTracksById(serviceId === "spotify" ? playlistId : undefined),
    google: useGooglePlaylistTracksById(serviceId === "google" ? playlistId : undefined),
  }

  return responses[serviceId]
};

export const useTrackIds = (
  serviceId: ServiceId,
  tracks?: Track[],
) => {
  const responses: Record<ServiceId, UseQueryResult<string[]> & { progress: number }> = {
    spotify: useSpotifyTrackIds(serviceId === "spotify" ? tracks : undefined),
    google: useGoogleTrackIds(serviceId === "google" ? tracks : undefined),
  }

  return responses[serviceId]
}

export const useCreatePlaylist = (
  serviceId: ServiceId,
) => {
  const responses: Record<ServiceId, UseMutationResult<string, Error, Playlist, unknown>> = {
    spotify: useCreateSpotifyPlaylist(),
    google: useCreateGooglePlaylist(),
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
    google: useAddTracksToSpotifyPlaylist(),
  }

  return responses[serviceId]
}

