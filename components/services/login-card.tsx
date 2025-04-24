import { ServiceId, useSignIn, useSignOut } from "@/lib/services";
import ServiceCard from "../ui/service-card";

export default function LoginCard({ serviceId }: { serviceId: ServiceId }) {
  const signIn = useSignIn(serviceId)
  const signOut = useSignOut(serviceId)

  const handleLogin = () => {
    signIn()
  }

  const handleLogout = () => {
    signOut()
  }

  return <ServiceCard serviceId={serviceId} handleLogin={handleLogin} handleLogout={handleLogout} />;
}
