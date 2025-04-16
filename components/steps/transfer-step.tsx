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

interface PlaylistTransferProps {
  sourceServiceId: ServiceId
  targetServiceId: ServiceId
  playlistId: string
}

export interface TransferStepProps {
  handleContinue: () => void
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

  const [sourceTracks, setSourceTracks] = useState<Track[]>()
  const [targetTrackIds, setTargetTrackIds] = useState<string[]>()
  const [targetPlaylistId, setTargetPlaylistId] = useState<string>()

  const { data: sourcePlaylist } = usePlaylistById(props.playlistId, props.sourceServiceId)

  const handleContinue = () => {
    setCurrentStep((prev) => prev + 1)
  }

  return (
    <PlaylistTransferContext.Provider value={{ ...props, sourceTracks, setSourceTracks, targetTrackIds, setTargetTrackIds, targetPlaylistId, setTargetPlaylistId }}>
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
              steps.map((Step, index) => {
                if (currentStep < index) return null
                return <Step key={index} handleContinue={handleContinue} />
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
  const [transferingPlaylistIndex] = useState(0)

  const sourcePlaylistsArray = useMemo(() => [...sourcePlaylistIds], [sourcePlaylistIds])

  const transferingPlaylistId = sourcePlaylistsArray[transferingPlaylistIndex]

  return (
    <div className="w-full flex flex-col relative gap-4">
      {
        transferingPlaylistId &&
        <PlaylistTransfer
          sourceServiceId={props.sourceServiceId}
          targetServiceId={props.targetServiceId}
          playlistId={transferingPlaylistId}
        />
      }
    </div>
  )
}