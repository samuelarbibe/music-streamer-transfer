"use client"

import { IStepProps } from "@/app/page";
import { useAtom } from "jotai/react";
import { ServiceId, sourcePlaylistsIdsAtom, Track } from "@/lib/services";
import { createContext, Dispatch, SetStateAction, useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { usePlaylistById } from "@/lib/services/index";
import LoadSourceTracksStep from "./transfer/load-source-tracks-step";
import CreateTargetPlaylistStep from "./transfer/create-target-playlist-step";
import LoadTargetTracksStep from "./transfer/load-target-tracks-step";
import AddTracksToPlaylistStep from "./transfer/add-tracks-to-playlist-step";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "../ui/button";
import { usePostHog } from "posthog-js/react";

interface PlaylistTransferProps {
  sourceServiceId: ServiceId
  targetServiceId: ServiceId
  playlistId: string
  handleContinue: () => void
}

export interface TransferStepProps {
  handleContinue: () => void
  handleError: (error: unknown) => void
}

const steps = [
  LoadSourceTracksStep,
  CreateTargetPlaylistStep,
  LoadTargetTracksStep,
  AddTracksToPlaylistStep
]

type PlaylistTransferContextType = PlaylistTransferProps & {
  sourceTracks: Track[] | undefined
  setSourceTracks: Dispatch<SetStateAction<Track[] | undefined>>
  targetTrackIds: string[] | undefined
  setTargetTrackIds: Dispatch<SetStateAction<string[] | undefined>>
  targetPlaylistId: string | undefined
  setTargetPlaylistId: Dispatch<SetStateAction<string | undefined>>
}

export const PlaylistTransferContext = createContext<PlaylistTransferContextType>({} as PlaylistTransferContextType)

function PlaylistTransfer(props: PlaylistTransferProps) {
  const posthog = usePostHog()
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<unknown>()

  const [sourceTracks, setSourceTracks] = useState<Track[]>()
  const [targetTrackIds, setTargetTrackIds] = useState<string[]>()
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>()

  const { data: sourcePlaylist } = usePlaylistById(props.sourceServiceId, props.playlistId)

  const handleContinue = useCallback(() => {
    setCurrentStep((prev) => prev + 1)
  }, [])

  const handleError = useCallback((error: unknown) => {
    posthog.captureException(error)
    setError(error)
  }, [posthog])

  useEffect(() => {
    if (currentStep === steps.length) {
      props.handleContinue()
    }
  }, [currentStep, props])

  const value = {
    ...props,
    sourceTracks,
    setSourceTracks,
    targetTrackIds,
    setTargetTrackIds,
    targetPlaylistId,
    setTargetPlaylistId
  }

  return (
    <PlaylistTransferContext.Provider value={value}>
      <Card>
        <CardContent className="flex flex-col gap-4">
          {
            sourcePlaylist &&
            <div className="flex flex-row gap-4">
              <img src={sourcePlaylist.image} className="h-12 w-12 object-cover rounded-[2px] md:rounded-[4px]" />
              <div className="flex flex-col items-start">
                <span className="text-lg ph-mask">{sourcePlaylist.name}</span>
                {
                  sourcePlaylist.trackCount &&
                  <span className="text-sm text-muted-foreground">{`${sourcePlaylist.trackCount} tracks`}</span>
                }
              </div>
            </div>
          }
          <div className="flex flex-col gap-1">
            {
              steps.map((Step, index) => {
                if (currentStep < index) return null
                return <Step key={`${props.playlistId}-${Step.name}`} handleContinue={handleContinue} handleError={handleError} />
              })
            }
          </div>
          {
            !!error &&
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="flex flex-row items-center">
                Failed to transfer playlist.
                <div className="flex-1" />
                <Button onClick={props.handleContinue}>Skip</Button>
              </AlertDescription>
            </Alert>
          }
        </CardContent>
      </Card>
    </PlaylistTransferContext.Provider>
  )
}

export default function TransferStep(props: IStepProps) {
  const [sourcePlaylistIds] = useAtom(sourcePlaylistsIdsAtom)
  const [currentPlaylistIndex, setCurrentPlaylistIndex] = useState(0)

  const sourcePlaylistsArray = useMemo(() => [...sourcePlaylistIds], [sourcePlaylistIds])

  const transferingPlaylistId = sourcePlaylistsArray[currentPlaylistIndex]

  const handleContinue = () => {
    setCurrentPlaylistIndex((prev) => prev + 1)
  }

  return (
    <div className="w-full flex flex-col relative gap-4">
      {
        currentPlaylistIndex < sourcePlaylistIds.size
          ? (
            <>
              <span className="text-xl">{`Transfering Playlist ${currentPlaylistIndex + 1}/${sourcePlaylistIds.size}`}</span>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Warning</AlertTitle>
                <AlertDescription>
                  Do not exit this page while playlists are transferring.
                </AlertDescription>
              </Alert>
            </>
          )
          : (
            <div className="flex flex-row items-center justify-center gap-2">
              <Check className="size-10 text-chart-2" />
              <span className="text-xl">Playlists Transferred successfully!</span>
            </div>
          )
      }
      {
        transferingPlaylistId &&
        <PlaylistTransfer
          key={transferingPlaylistId}
          playlistId={transferingPlaylistId}
          sourceServiceId={props.sourceServiceId}
          targetServiceId={props.targetServiceId}
          handleContinue={handleContinue}
        />
      }
    </div>
  )
}