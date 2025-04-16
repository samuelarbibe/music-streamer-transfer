import { services, useTrackIds } from "@/lib/services"
import { PlaylistTransferContext, TransferStepProps } from "../transfer-step"
import { LoaderCircle, Check } from "lucide-react"
import { useContext, useEffect, useRef } from "react"

export default function LoadTargetTracksStep({ handleContinue }: TransferStepProps) {
  const sent = useRef(false)

  const { targetServiceId, sourceTracks, setTargetTrackIds } = useContext(PlaylistTransferContext)
  const {
    data: targetTrackIds,
    isLoading,
    progress
  } = useTrackIds(sourceTracks ?? [], targetServiceId)

  useEffect(() => {
    if (targetTrackIds?.length && !sent.current) {
      sent.current = true
      setTargetTrackIds(targetTrackIds)
      handleContinue()
    }
  }, [handleContinue, setTargetTrackIds, targetTrackIds])

  return (
    <div className="gap-2 flex flex-row items-center">
      {
        isLoading
          ? (
            <>
              <LoaderCircle className="size-5 animate-spin" />
              <span className="text-sm animate-pulse">{`Loading Tracks... (${progress}/${sourceTracks?.length})`}</span>
            </>
          )
          : (
            <>
              <Check className="size-5 text-chart-2" />
              <span className="text-sm">{`Tracks successfully loaded from ${services[targetServiceId].name}.`}</span>
            </>
          )
      }
    </div>
  )
}