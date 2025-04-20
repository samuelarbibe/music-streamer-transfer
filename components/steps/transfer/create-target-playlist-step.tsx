import { services, useCreatePlaylist, usePlaylistById, usePlaylists } from "@/lib/services"
import { PlaylistTransferContext, TransferStepProps } from "../transfer-step"
import { LoaderCircle, Check } from "lucide-react"
import { useContext, useEffect, useMemo, useRef } from "react"

export default function CreateTargetPlaylistStep({ handleContinue, handleError }: TransferStepProps) {
  const requestSent = useRef(false)

  const { playlistId, sourceServiceId, targetServiceId, setTargetPlaylistId } = useContext(PlaylistTransferContext)

  const { data: targetPlaylists, error: targetPlaylistsError } = usePlaylists(targetServiceId)
  const { data: sourcePlaylist, error: sourcePlaylistError } = usePlaylistById(sourceServiceId, playlistId)
  const { mutate: createPlaylist, error: createPlaylistError, isSuccess: isCreated } = useCreatePlaylist(targetServiceId, {
    onSuccess: (createdPlaylistId) => {
      setTargetPlaylistId(createdPlaylistId)
      handleContinue()
    }
  })

  const error = targetPlaylistsError || sourcePlaylistError || createPlaylistError

  const existingTargetPlaylistId = useMemo(() => {
    if (!targetPlaylists || !sourcePlaylist) return false

    return targetPlaylists.find((targetPlaylist) => targetPlaylist.name === sourcePlaylist.name)?.id ?? null
  }, [sourcePlaylist, targetPlaylists])

  useEffect(() => {
    if (error) {
      handleError(error.message)
    }
  }, [error, handleError])

  useEffect(() => {
    if (existingTargetPlaylistId === false || !sourcePlaylist || requestSent.current) return
    requestSent.current = true

    if (existingTargetPlaylistId) {
      setTargetPlaylistId(existingTargetPlaylistId)
      handleContinue()
    } else {
      createPlaylist(sourcePlaylist)
    }
  }, [createPlaylist, handleContinue, setTargetPlaylistId, sourcePlaylist, existingTargetPlaylistId])

  const getContent = () => {
    if (error) {
      return (
        <>
          <LoaderCircle className="size-5" />
          <span className="text-sm">{`Error while creating playlist.`}</span>
        </>
      )
    }

    if (isCreated) {
      return (
        <>
          <Check className="size-5 text-chart-2" />
          <span className="text-sm">{`Playlist "${sourcePlaylist?.name}" Created in ${services[targetServiceId].name}.`}</span>
        </>
      )
    }

    if (existingTargetPlaylistId) {
      return (
        <>
          <Check className="size-5 text-chart-2" />
          <span className="text-sm">{`Playlist "${sourcePlaylist?.name}" Already exists in ${services[targetServiceId].name}.`}</span>
        </>
      )
    }

    return (
      <>
        <LoaderCircle className="size-5 animate-spin" />
        <span className="text-sm animate-pulse">{`Creating Playlist "${sourcePlaylist?.name}" in ${services[targetServiceId].name}...`}</span>
      </>
    )
  }

  return (
    <div className="gap-2 flex flex-row items-center">
      {getContent()}
    </div>
  )
}