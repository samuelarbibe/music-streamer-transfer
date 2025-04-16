import { sourcePlaylistsIdsAtom } from "@/lib/services"
import { useAtom } from "jotai/react"
import { Button } from "../ui/button"
import { IStepProps } from "@/app/page"
import PlaylistsList from "../services/playlists-list"

export default function PlaylistSelectionStep(props: IStepProps) {
  const [sourcePlaylistsIds] = useAtom(sourcePlaylistsIdsAtom)

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        <span className="text-lg">Select the playlists you want to transfer</span>

        <PlaylistsList serviceId={props.sourceServiceId} />
      </div>
      <div className="flex flex-row w-full items-center justify-center gap-3">
        <Button
          size="lg"
          variant='outline'
          onClick={props.handleBack}
        >
          Back
        </Button>
        <Button
          size="lg"
          onClick={props.handleContinue}
          disabled={!sourcePlaylistsIds.size}
        >
          Transfer
        </Button>
      </div>
    </>
  )
}