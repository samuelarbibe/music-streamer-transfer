import React, { forwardRef } from "react";

import ServiceCard from "../ui/service-card";
import { signIn } from "next-auth/react";

const SpotifyCard = forwardRef<HTMLDivElement>((_props, ref) => {
  const handleLogin = () => {
    signIn("spotify")
  }

  return (
    <ServiceCard ref={ref} serviceId="spotify" handleLogin={handleLogin} />
  )
})

SpotifyCard.displayName = "SpotifyCard"

export default SpotifyCard