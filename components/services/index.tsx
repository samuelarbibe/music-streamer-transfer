import { ServiceId } from "@/lib/services";
import { ForwardRefExoticComponent, RefAttributes, forwardRef } from "react";
import AppleCard from "./apple";
import SpotifyCard from "./spotify";

const ServiceComponents: Record<ServiceId, ForwardRefExoticComponent<RefAttributes<HTMLDivElement>>> = {
  apple: AppleCard,
  spotify: SpotifyCard
};

const Service = forwardRef<HTMLDivElement, { serviceId: ServiceId }>(({ serviceId }, ref) => {
  const ServiceComponent = ServiceComponents[serviceId];

  return <ServiceComponent ref={ref} />;
});

Service.displayName = "Service"

export default Service;