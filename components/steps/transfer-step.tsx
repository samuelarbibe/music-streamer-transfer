import { IStepProps } from "@/app/page";
import { useAtom } from "jotai/react";
import { ServiceId, sourcePlaylistsIdsAtom, Track } from "@/lib/services";
import { createContext, Dispatch, SetStateAction, useMemo, useState } from "react";
import { Card, CardContent } from "../ui/card";
import { usePlaylistById } from "@/lib/services/index";
import LoadSourceTracksStep from "./transfer/load-source-tracks-step";
import CreateTargetPlaylistStep from "./transfer/create-target-playlist-step";
import LoadTargetTracksStep from "./transfer/load-target-tracks-step";
import AddTracksToPlaylistStep from "./transfer/add-tracks-to-playlist-step";
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";
import { AlertCircle, Check } from "lucide-react";
import { Button } from "../ui/button";

interface PlaylistTransferProps {
  sourceServiceId: ServiceId
  targetServiceId: ServiceId
  playlistId: string
  handleContinue: () => void
}

export interface TransferStepProps {
  handleContinue: () => void
  handleError: (message: string) => void
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
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string>("Failed while doing something something")

  const [sourceTracks, setSourceTracks] = useState<Track[]>()
  const [targetTrackIds, setTargetTrackIds] = useState<string[]>()
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>()

  const { data: sourcePlaylist } = usePlaylistById(props.sourceServiceId, props.playlistId)

  const handleContinue = () => {
    if (currentStep === steps.length - 1) {
      props.handleContinue()
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleError = (error: string) => {
    setError(error)
  }

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
              <img src={sourcePlaylist.image} className="h-12 w-12 object-cover" />
              <div className="flex flex-col items-start">
                <span className="text-lg">{sourcePlaylist.name}</span>
                <span className="text-sm text-muted-foreground">{`${sourcePlaylist.trackCount} tracks`}</span>
              </div>
            </div>
          }
          <div className="flex flex-col gap-1">
            {
              error &&
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  Failed to transfer playlist.
                  <Button onClick={() => setCurrentStep(0)}>Try Again</Button>
                  <Button onClick={props.handleContinue}>Skip</Button>
                </AlertDescription>
              </Alert>
            }
            {
              steps.map((Step, index) => {
                if (currentStep < index) return null
                return <Step key={Step.name} handleContinue={handleContinue} handleError={handleError} />
              })
            }
          </div>
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
                  Do not exit this page while playlists are transfering.
                </AlertDescription>
              </Alert>
            </>
          )
          : (
            <div className="flex flex-row items-center">
              <Check className="size-10 text-chart-2" />
              <span className="text-2xl">Playlists Transfered successfully!</span>
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