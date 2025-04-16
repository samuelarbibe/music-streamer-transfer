import { services, useCreatePlaylist, usePlaylistById, usePlaylists } from "@/lib/services"
import { PlaylistTransferContext, TransferStepProps } from "../transfer-step"
import { LoaderCircle, Check } from "lucide-react"
import { useContext, useEffect, useMemo, useRef } from "react"

export default function CreateTargetPlaylistStep({ handleContinue }: TransferStepProps) {
  const requestSent = useRef(false)

  const { playlistId, sourceServiceId, targetServiceId, setTargetPlaylistId } = useContext(PlaylistTransferContext)

  const { data: targetPlaylists } = usePlaylists(targetServiceId)
  const { data: sourcePlaylist } = usePlaylistById(playlistId, sourceServiceId)
  const { mutate: createPlaylist, isPending: isCreating } = useCreatePlaylist(targetServiceId)

  const targetPlaylistId = useMemo(() => {
    if (!targetPlaylists || !sourcePlaylist) return false

    return targetPlaylists.find((targetPlaylist) => targetPlaylist.name === sourcePlaylist.name)?.id ?? null
  }, [sourcePlaylist, targetPlaylists])

  useEffect(() => {
    if (targetPlaylistId === false || !sourcePlaylist || requestSent.current) return
    requestSent.current = true

    if (targetPlaylistId) {
      setTargetPlaylistId(targetPlaylistId)
      handleContinue()
    } else {
      createPlaylist(sourcePlaylist, {
        onSuccess: (createdPlaylistId) => {
          setTargetPlaylistId(createdPlaylistId)
          handleContinue()
        }
      })
    }
  }, [createPlaylist, handleContinue, setTargetPlaylistId, sourcePlaylist, targetPlaylistId])

  const getContent = () => {
    if (isCreating) {
      return (
        <>
          <LoaderCircle className="size-5 animate-spin" />
          <span className="text-sm animate-pulse">{`Creating Playlist "${sourcePlaylist?.name}" in ${services[targetServiceId].name}...`}</span>
        </>
      )
    }

    if (targetPlaylistId) {
      return (
        <>
          <Check className="size-5 text-chart-2" />
          <span className="text-sm">{`Playlist "${sourcePlaylist?.name}" Already exists in ${services[targetServiceId].name}.`}</span>
        </>
      )
    }

    return (
      <>
        <Check className="size-5 text-chart-2" />
        <span className="text-sm">{`Playlist "${sourcePlaylist?.name}" Created in ${services[targetServiceId].name}.`}</span>
      </>
    )
  }

  return (
    <div className="gap-2 flex flex-row items-center">
      {getContent()}
    </div>
  )
}