'use client'

import React, { forwardRef } from "react";
import { ServiceId, services, useIsAccessTokenExpired, useServiceUser } from "@/lib/services";
import { Button } from "./button";
import { Check, ClockAlert, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";

type ServiceCardProps = {
  serviceId: ServiceId;
  handleLogin: () => void;
  handleLogout: () => void;
};

const ServiceCard = forwardRef<HTMLDivElement, ServiceCardProps>(({ serviceId, handleLogin, handleLogout }, ref) => {
  const user = useServiceUser(serviceId);
  const isAccessTokenExpired = useIsAccessTokenExpired(serviceId)

  return (
    <Card ref={ref} className="flex-1 flex-col bg-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          {React.createElement(services[serviceId].icon, { className: "mr-2 h-5 w-5" })}
          {services[serviceId].name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4 flex-1 items-center">
        <div className="rounded-full bg-muted">
          {
            user
              ? isAccessTokenExpired
                ? <ClockAlert className={"size-6 m-3"} />
                : user.image
                  ? <img src={user.image} className="size-15 rounded-full" />
                  : <Check className={"size-6 m-3"} />
              : <Lock className={"size-6 m-3"} />
          }
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {
            user
              ? isAccessTokenExpired
                ? "Token has expired, Please login again."
                : `Logged in as ${user.name}`
              : `Please log in to view your ${services[serviceId].name} details`
          }
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        {
          (!user || isAccessTokenExpired)
            ? <Button onClick={handleLogin}>Login</Button>
            : <Button variant='outline' onClick={handleLogout}>Logout</Button>
        }
      </CardFooter>
    </Card>
  );
});

ServiceCard.displayName = "ServiceCard";

export default ServiceCard;