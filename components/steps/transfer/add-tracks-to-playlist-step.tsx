import { services, useAddTracksToPlaylist, usePlaylistTracksById } from "@/lib/services"
import { PlaylistTransferContext, TransferStepProps } from "../transfer-step"
import { LoaderCircle, Check } from "lucide-react"
import { useContext, useEffect, useMemo, useRef } from "react"

export default function AddTracksToPlaylistStep({ handleContinue, handleError }: TransferStepProps) {
  const requestSent = useRef(false)
  const { targetServiceId, targetTrackIds, targetPlaylistId } = useContext(PlaylistTransferContext)

  const {
    data: existingTargetTracks,
    isLoading: isLoadingTargetPlaylistTracks,
    error: existingTargetTracksError
  } = usePlaylistTracksById(targetServiceId, targetPlaylistId)

  const {
    mutate: addTracksToPlaylist,
    isPending,
    progress,
    error: addTracksToPlaylistError
  } = useAddTracksToPlaylist(targetServiceId)

  const error = existingTargetTracksError || addTracksToPlaylistError

  const tracksIdsToBeAdded = useMemo(() =>
    existingTargetTracks && targetTrackIds?.filter((trackId) => !existingTargetTracks?.find((track) => track.id === trackId))
    , [targetTrackIds, existingTargetTracks])

  useEffect(() => {
    if (error) {
      handleError(error.message)
    }
  }, [error, handleError])

  useEffect(() => {
    if (tracksIdsToBeAdded && targetPlaylistId && !requestSent.current) {
      requestSent.current = true

      addTracksToPlaylist({
        playlistId: targetPlaylistId,
        trackIds: tracksIdsToBeAdded
      }, {
        onSuccess: handleContinue
      })
    }
  }, [addTracksToPlaylist, handleContinue, targetPlaylistId, tracksIdsToBeAdded])

  const getContent = () => {
    if (error) {
      return (
        <>
          <LoaderCircle className="size-5" />
          <span className="text-sm">{`Error while transfering playlist.`}</span>
        </>
      )
    }

    if (tracksIdsToBeAdded?.length === 0) {
      return (
        <>
          <Check className="size-5 text-chart-2" />
          <span className="text-sm">{`All tracks Already exist in ${services[targetServiceId].name}.`}</span>
        </>
      )
    }

    if (isLoadingTargetPlaylistTracks) {
      return (
        <>
          <LoaderCircle className="size-5 animate-spin" />
          <span className="text-sm animate-pulse">{`Checking what tracks already exist in ${services[targetServiceId].name}...`}</span>
        </>
      )
    }

    if (isPending) {
      const existingTrackCount = (targetTrackIds?.length ?? 0) - (tracksIdsToBeAdded?.length ?? 0)
      if (existingTrackCount > 0) {
        return (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            <span className="text-sm animate-pulse">{`${existingTrackCount} tracks already exist in ${services[targetServiceId].name}. Adding missing tracks... (${progress}/${tracksIdsToBeAdded?.length})`}</span>
          </>
        )
      }
      else {
        return (
          <>
            <LoaderCircle className="size-5 animate-spin" />
            <span className="text-sm animate-pulse">{`Adding tracks... (${progress}/${tracksIdsToBeAdded?.length})`}</span>
          </>
        )
      }
    }

    return (
      <>
        <Check className="size-5 text-chart-2" />
        <span className="text-sm">{`${tracksIdsToBeAdded?.length} tracks successfully added to ${services[targetServiceId].name}.`}</span>
      </>
    )
  }

  return (
    <div className="gap-2 flex flex-row items-center">
      {getContent()}
    </div>
  )
}