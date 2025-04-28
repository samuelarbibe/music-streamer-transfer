"use client"

import { googleAccessTokenAtom, googleOauthStateAtom } from "@/lib/services/google";
import { useAtomValue, useSetAtom } from "jotai/react";
import { useEffect } from "react"

export default function GoogleAuthCallback() {
  const oauthState = useAtomValue(googleOauthStateAtom)
  const setAccessToken = useSetAtom(googleAccessTokenAtom)

  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.hash.substring(1));
    const accessToken = searchParams.get('access_token')
    const state = searchParams.get('state')

    if (accessToken && oauthState && state === oauthState) {
      setAccessToken(accessToken)
    }

    window.location.href = '/'
  }, [oauthState, setAccessToken])

  return null
}