import { ServiceId, serviceSessionsAtom } from "@/lib/services";
import { forwardRef } from "react";
import ServiceCard from "../ui/service-card";
import { signIn, signOut } from "next-auth/react";
import { useSetAtom } from "jotai/react";
import update from "immutability-helper"

const LoginCard = forwardRef<HTMLDivElement, { serviceId: ServiceId }>(({ serviceId }, ref) => {
  const setServiceSessions = useSetAtom(serviceSessionsAtom)

  const handleLogin = () => {
    signIn(serviceId)
  }

  const handleLogout = () => {
    setServiceSessions((prev) => update(prev, { $unset: [serviceId] }))
    signOut({ redirect: false })
  }

  return <ServiceCard ref={ref} serviceId={serviceId} handleLogin={handleLogin} handleLogout={handleLogout} />;
});

LoginCard.displayName = "LoginCard"

export default LoginCard;