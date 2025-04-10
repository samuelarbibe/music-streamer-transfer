import AppleMusicIcon from "@/assets/icons/apple.svg";
import SpotifyIcon from "@/assets/icons/spotify.svg";
import { atomWithStorage } from "jotai/utils";
import { useSession } from "next-auth/react";
import { SVGElementType } from "react";

export const sourceServiceIdAtom = atomWithStorage<ServiceId | null>(
  "sourceServiceId",
  null
);
export const targetServiceIdAtom = atomWithStorage<ServiceId | null>(
  "targetServiceId",
  null
);

export type ServiceId = "apple" | "spotify";

export type Service = {
  name: string;
  bgColor: string;
  textColor: string;
  borderColor: string;
  icon: SVGElementType;
};

export const services: Record<ServiceId, Service> = {
  apple: {
    name: "Apple Music",
    bgColor: "apple",
    textColor: "apple",
    borderColor: "apple",
    icon: AppleMusicIcon,
  },
  spotify: {
    name: "Spotify",
    bgColor: "spotify",
    textColor: "spotify",
    borderColor: "spotify",
    icon: SpotifyIcon,
  },
};

export const useIsLoggedInWith = (serviceId: ServiceId | null) => {
  const { data } = useSession();
  // @ts-expect-error session
  return serviceId && data?.providers?.[serviceId]?.accessToken;
};
