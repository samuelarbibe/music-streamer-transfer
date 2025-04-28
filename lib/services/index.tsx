"use client"

import SpotifyIcon from "@/assets/icons/spotify.svg";
import YoutubeIcon from "@/assets/icons/youtube.svg";
import AppleIcon from "@/assets/icons/apple.svg";
import { UseMutationOptions, UseMutationResult, UseQueryResult } from "@tanstack/react-query";
import { atomWithStorage } from "jotai/utils";
import { atom } from "jotai/vanilla";
import { SVGElementType } from "react";
import { useAddTracksToSpotifyPlaylist, useCreateSpotifyPlaylist, useIsSpotifyAuthenticated, useSpotifyPlaylistById, useSpotifyPlaylists, useSpotifyPlaylistTracksById, useSpotifySignIn, useSpotifyTrackIds, useSpotifyProfile, useSpotifySignOut } from "./spotify";
import { useAddTracksToGooglePlaylist, useCreateGooglePlaylist, useGooglePlaylistById, useGooglePlaylists, useGooglePlaylistTracksById, useGoogleProfile, useGoogleSignIn, useGoogleSignOut, useGoogleTrackIds, useIsGoogleAuthenticated } from "./google";
import { useAddTracksToApplePlaylist, useApplePlaylistById, useApplePlaylists, useApplePlaylistTracksById, useAppleProfile, useAppleSignIn, useAppleSignOut, useAppleTrackIds, useCreateApplePlaylist, useIsAppleAuthenticated } from "./apple";

export const sourcePlaylistsIdsAtom = atom<Set<string>>(new Set<string>());

export const sourceServiceIdAtom = atomWithStorage<ServiceId | null>(
  "sourceServiceId",
  null
);
export const targetServiceIdAtom = atomWithStorage<ServiceId | null>(
  "targetServiceId",
  null
);

export type ServiceId = "spotify" | "google" | "apple";

export type Track = {
  id: string
  name: string
  artists: string[]
}

export type Playlist = {
  id: string
  name: string,
  description?: string,
  image: string,
  link?: string,
  trackCount?: number
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
  apple: {
    name: "Apple Music",
    bgColor: "apple",
    textColor: "apple",
    borderColor: "apple",
    icon: AppleIcon,
  },
};

export interface ServiceProfile {
  name: string
  imageUrl: string
}

export const useServiceProfile = (serviceId: ServiceId) => {
  const responses: Record<ServiceId, UseQueryResult<ServiceProfile | null, Error>> = {
    spotify: useSpotifyProfile(),
    google: useGoogleProfile(),
    apple: useAppleProfile(),
  }

  return responses[serviceId]
}

export const useIsServiceAuthenticated = (serviceId: ServiceId) => {
  const responses: Record<ServiceId, UseQueryResult<boolean, Error>> = {
    spotify: useIsSpotifyAuthenticated(),
    google: useIsGoogleAuthenticated(),
    apple: useIsAppleAuthenticated(),
  }

  return responses[serviceId]
}

export const useSignIn = (serviceId: ServiceId) => {
  const responses: Record<ServiceId, () => void> = {
    spotify: useSpotifySignIn(),
    google: useGoogleSignIn(),
    apple: useAppleSignIn(),
  }

  return responses[serviceId]
}

export const useSignOut = (serviceId: ServiceId) => {
  const responses: Record<ServiceId, () => void> = {
    spotify: useSpotifySignOut(),
    google: useGoogleSignOut(),
    apple: useAppleSignOut()
  }

  return responses[serviceId]
}

export const usePlaylists = (serviceId: ServiceId) => {
  const responses: Record<ServiceId, UseQueryResult<Playlist[] | undefined>> = {
    spotify: useSpotifyPlaylists(serviceId === "spotify"),
    google: useGooglePlaylists(serviceId === "google"),
    apple: useApplePlaylists(serviceId === "apple")
  }

  return responses[serviceId]
}

export const usePlaylistById = (
  serviceId: ServiceId,
  playlistId?: string,
) => {
  const responses: Record<ServiceId, UseQueryResult<Playlist | undefined>> = {
    spotify: useSpotifyPlaylistById(serviceId === "spotify" ? playlistId : undefined),
    google: useGooglePlaylistById(serviceId === "google" ? playlistId : undefined),
    apple: useApplePlaylistById(serviceId === "apple" ? playlistId : undefined),
  }

  return responses[serviceId]
};

export const usePlaylistTracksById = (
  serviceId: ServiceId,
  playlistId?: string,
) => {
  const responses: Record<ServiceId, UseQueryResult<Track[] | undefined>> = {
    spotify: useSpotifyPlaylistTracksById(serviceId === "spotify" ? playlistId : undefined),
    google: useGooglePlaylistTracksById(serviceId === "google" ? playlistId : undefined),
    apple: useApplePlaylistTracksById(serviceId === "apple" ? playlistId : undefined),
  }

  return responses[serviceId]
};

export const useTrackIds = (
  serviceId: ServiceId,
  tracks?: Track[],
) => {
  const responses: Record<ServiceId, UseQueryResult<string[] | undefined> & { progress: number }> = {
    spotify: useSpotifyTrackIds(serviceId === "spotify" ? tracks : undefined),
    google: useGoogleTrackIds(serviceId === "google" ? tracks : undefined),
    apple: useAppleTrackIds(serviceId === "apple" ? tracks : undefined),
  }

  return responses[serviceId]
}

export const useCreatePlaylist = (
  serviceId: ServiceId,
  options: Partial<UseMutationOptions<string | undefined, Error, Playlist, unknown>> = {}
) => {
  const responses: Record<ServiceId, UseMutationResult<string | undefined, Error, Playlist, unknown>> = {
    spotify: useCreateSpotifyPlaylist(options),
    google: useCreateGooglePlaylist(options),
    apple: useCreateApplePlaylist(options),
  }

  return responses[serviceId]
}


export interface AddTracksToPlaylistProps { trackIds: string[], playlistId: string }
type AddTracksToPlaylistResult = UseMutationResult<string, Error, AddTracksToPlaylistProps, unknown> & { progress: number }

export const useAddTracksToPlaylist = (
  serviceId: ServiceId,
  options: UseMutationOptions<string, Error, AddTracksToPlaylistProps, unknown> = {}
) => {
  const responses: Record<ServiceId, AddTracksToPlaylistResult> = {
    spotify: useAddTracksToSpotifyPlaylist(options),
    google: useAddTracksToGooglePlaylist(options),
    apple: useAddTracksToApplePlaylist(options),
  }

  return responses[serviceId]
}
