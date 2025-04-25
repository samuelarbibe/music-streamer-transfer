import { ScrollArea } from "./scroll-area"
import { Checkbox } from "./checkbox"
import { useAtom } from "jotai/react"
import { sourcePlaylistsIdsAtom } from "@/lib/services"
import { Playlist } from "@/lib/services/index"
import { ExternalLink } from "lucide-react"

interface PlaylistsProps {
  playlists: Playlist[]
}

export default function Playlists(props: PlaylistsProps) {
  const [sourcePlaylistsIds, setSourcePlaylistsIds] = useAtom(sourcePlaylistsIdsAtom)

  return (
    <ScrollArea className="h-72 w-full rounded-md border">
      {
        props.playlists.map((playlist) => (
          <div
            key={playlist.name}
            className="border-b p-4 flex flex-row gap-4 items-center hover:bg-muted"
            onClick={() => setSourcePlaylistsIds((prev) => {
              const next = new Set(prev)
              if (next.has(playlist.id)) next.delete(playlist.id)
              else next.add(playlist.id)

              return next
            })}
          >
            <Checkbox checked={sourcePlaylistsIds.has(playlist.id)} />
            <img src={playlist.image} className="h-12 w-12 object-cover rounded-[2px] md:rounded-[4px]" />
            <div className="flex flex-col items-start">
              <div className="flex flex-row items-center">
                <span className="text-lg">{playlist.name}</span>
                {
                  playlist.link &&
                  <a href={playlist.link} target='_blank' rel="noopener noreferrer"><ExternalLink className="mx-2 size-4" /></a>
                }
              </div>
              {
                playlist.trackCount &&
                <span className="text-sm text-muted-foreground">{`${playlist.trackCount} tracks`}</span>
              }
            </div>
          </div>
        ))
      }
    </ScrollArea >
  )
}