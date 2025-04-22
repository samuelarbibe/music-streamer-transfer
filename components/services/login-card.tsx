import { ServiceId, useSignIn, useSignOut } from "@/lib/services";
import { forwardRef } from "react";
import ServiceCard from "../ui/service-card";

const LoginCard = forwardRef<HTMLDivElement, { serviceId: ServiceId }>(({ serviceId }, ref) => {
  const signIn = useSignIn(serviceId)
  const signOut = useSignOut(serviceId)

  const handleLogin = () => {
    signIn()
  }

  const handleLogout = () => {
    signOut()
  }

  return <ServiceCard ref={ref} serviceId={serviceId} handleLogin={handleLogin} handleLogout={handleLogout} />;
});

LoginCard.displayName = "LoginCard"

export default LoginCard;