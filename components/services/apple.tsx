import React, { forwardRef } from "react";

import ServiceCard from "../ui/service-card";
import { signIn } from "next-auth/react";

const AppleCard = forwardRef<HTMLDivElement>((_props, ref) => {
  const handleLogin = () => {
    signIn("apple")
  }

  return (
    <ServiceCard ref={ref} serviceId="apple" handleLogin={handleLogin} />
  )
})

AppleCard.displayName = "AppleCard"

export default AppleCard;