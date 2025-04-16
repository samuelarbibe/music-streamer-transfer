import { services, usePlaylistTracksById } from "@/lib/services"
import { PlaylistTransferContext, TransferStepProps } from "../transfer-step"
import { LoaderCircle, Check } from "lucide-react"
import { useContext, useEffect, useRef } from "react"

export default function LoadSourceTracksStep({ handleContinue }: TransferStepProps) {
  const sent = useRef(false)
  const { playlistId, sourceServiceId, setSourceTracks } = useContext(PlaylistTransferContext)
  const { data: sourceTracks, isLoading } = usePlaylistTracksById(playlistId, sourceServiceId)

  useEffect(() => {
    if (sourceTracks && !sent.current) {
      sent.current = true
      setSourceTracks(sourceTracks)
      handleContinue()
    }
  }, [handleContinue, setSourceTracks, sourceTracks])

  return (
    <div className="gap-2 flex flex-row items-center">
      {
        isLoading
          ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              <span className="text-sm animate-pulse">Loading Tracks...</span>
            </>
          )
          : (
            <>
              <Check className="size-5 text-chart-2" />
              <span className="text-sm">Track data loaded from {services[sourceServiceId].name}.</span>
            </>
          )
      }
    </div>
  )
}