"use client"

import { services, useTrackIds } from "@/lib/services"
import { PlaylistTransferContext, TransferStepProps } from "../transfer-step"
import { LoaderCircle, Check } from "lucide-react"
import { useContext, useEffect, useRef } from "react"
import { Progress } from "@/components/ui/progress"

export default function LoadTargetTracksStep({ handleContinue, handleError }: TransferStepProps) {
  const sent = useRef(false)

  const { targetServiceId, sourceTracks, setTargetTrackIds } = useContext(PlaylistTransferContext)
  const {
    data: targetTrackIds,
    isLoading,
    progress,
    error
  } = useTrackIds(targetServiceId, sourceTracks)

  useEffect(() => {
    if (error) {
      handleError(error)
    }
  }, [error, handleError])

  useEffect(() => {
    if (targetTrackIds?.length && !sent.current) {
      sent.current = true
      setTargetTrackIds(targetTrackIds)
      handleContinue()
    }
  }, [handleContinue, setTargetTrackIds, targetTrackIds])

  const getContent = () => {
    if (error) {
      return (
        <>
          <LoaderCircle className="size-5" />
          <span className="text-sm">Error while loading tracks from source.</span>
        </>
      )
    }

    if (isLoading) {
      return (
        <>
          <LoaderCircle className="size-5 animate-spin" />
          <span className="text-sm animate-pulse whitespace-nowrap">{`Loading Tracks... (${progress}/${sourceTracks?.length})`}</span>
          <Progress value={progress / (sourceTracks?.length ?? 0) * 100} />
        </>
      )
    }

    return (
      <>
        <Check className="size-5 text-chart-2" />
        <span className="text-sm">{`Tracks successfully loaded from ${services[targetServiceId].name}.`}</span>
      </>
    )
  }

  return (
    <div className="gap-2 flex flex-row items-center">
      {getContent()}
    </div>
  )
}