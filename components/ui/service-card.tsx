'use client'

import React, { forwardRef } from "react";
import { ServiceId, services, useIsLoggedInWith } from "@/lib/services";
import { Button } from "./button";
import { Check, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";

type ServiceCardProps = {
  serviceId: ServiceId;
  handleLogin: () => void;
};

const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(({ serviceId, handleLogin }, ref) => {
  const loggedIn = useIsLoggedInWith(serviceId);

  return (
    <Card ref={ref} className="flex-1 flex-col bg-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          {React.createElement(services[serviceId].icon, { className: "mr-2 h-5 w-5" })}
          {services[serviceId].name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4 flex-1 items-center">
        <div className="rounded-full bg-muted p-3">
          {
            loggedIn
              ? <Check className={`h-6 w-6 text-${services[serviceId].textColor}`} />
              : <Lock className={`h-6 w-6 text-${services[serviceId].textColor}`} />
          }
        </div>
        <p className="text-center text-sm text-gray-500">
          Please log in to view your {services[serviceId].name} details
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        {
          !loggedIn &&
          (
            <Button onClick={handleLogin}>
              Login
            </Button>
          )
        }
      </CardFooter>
    </Card>
  );
});

ServiceCard.displayName = "ServiceCard";

export default ServiceCard;