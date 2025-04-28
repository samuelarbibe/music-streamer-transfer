"use client"

import { spotifyAccessTokenAtom } from "@/lib/services/spotify";
import { AuthenticationResponse, AuthorizationCodeWithPKCEStrategy, SpotifyApi } from "@spotify/web-api-ts-sdk";
import { useSetAtom } from "jotai/react";
import { useEffect } from "react"

export default function SpotifyAuthCallback() {
  const setAccessToken = useSetAtom(spotifyAccessTokenAtom)

  useEffect(() => {
    (async () => {
      const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID as string
      const redirectUrl = process.env.NEXT_PUBLIC_SPOTIFY_CALLBACK_URL as string
      const activeScopes = ["user-read-email", "playlist-read-private", "playlist-modify-public", "playlist-modify-private", "user-library-read user-library-modify"]

      const auth = new AuthorizationCodeWithPKCEStrategy(clientId, redirectUrl, activeScopes);
      const internalSdk = new SpotifyApi(auth);

      const { authenticated, accessToken } = await internalSdk.authenticate().catch(() => ({ authenticated: false }) as AuthenticationResponse)

      if (authenticated) {
        setAccessToken(accessToken)
      }

      window.location.href = '/'
    })()
  }, [setAccessToken])

  return null
}