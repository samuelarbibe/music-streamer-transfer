import { ServiceId } from "@/lib/services";
import Playlists from "@/components/ui/playlists";
import { usePlaylists } from "@/lib/services/index";

export default function PlaylistsList({ serviceId }: { serviceId: ServiceId }) {
  const { data } = usePlaylists(serviceId)

  return <Playlists playlists={data ?? []} />
}