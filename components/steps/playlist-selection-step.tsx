"use client"

import { sourcePlaylistsIdsAtom } from "@/lib/services"
import { useAtom } from "jotai/react"
import { Button } from "../ui/button"
import { IStepProps } from "@/app/page"
import PlaylistsList from "../services/playlists-list"
import { Alert, AlertDescription } from "../ui/alert"
import { AlertCircle } from "lucide-react"

export default function PlaylistSelectionStep(props: IStepProps) {
  const [sourcePlaylistsIds] = useAtom(sourcePlaylistsIdsAtom)

  return (
    <>
      <div className="w-full flex flex-col gap-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            If you want to transfer your liked songs, create a playlist and transfer it.
          </AlertDescription>
        </Alert>
        <span className="text-lg">Select the playlists you want to transfer:</span>
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