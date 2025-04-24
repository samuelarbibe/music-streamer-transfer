'use client'

import React from "react";
import { ServiceId, services, useIsServiceAuthenticated, useServiceProfile } from "@/lib/services";
import { Button } from "./button";
import { Check, Lock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./card";

type ServiceCardProps = {
  serviceId: ServiceId;
  handleLogin: () => void;
  handleLogout: () => void;
};

export default function ServiceCard({ serviceId, handleLogin, handleLogout }: ServiceCardProps) {
  const { data: profile } = useServiceProfile(serviceId);
  const { data: isAuthenticated } = useIsServiceAuthenticated(serviceId)

  return (
    <Card className="flex-1 flex-col bg-card">
      <CardHeader>
        <CardTitle className="flex items-center">
          {React.createElement(services[serviceId].icon, { className: "mr-2 h-5 w-5" })}
          {services[serviceId].name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col space-y-4 flex-1 items-center">
        <div className="rounded-full bg-muted">
          {
            profile
              ? profile.imageUrl
                ? <img src={profile.imageUrl} className="size-15 rounded-full" />
                : <Check className={"size-6 m-3"} />
              : <Lock className={"size-6 m-3"} />
          }
        </div>
        <p className="text-center text-sm text-muted-foreground">
          {
            isAuthenticated && profile
              ? `Logged in as ${profile.name}`
              : `Please log in to view your ${services[serviceId].name} details`
          }
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        {
          isAuthenticated
            ? <Button variant='outline' onClick={handleLogout}>Logout</Button>
            : <Button onClick={handleLogin}>Login</Button>
        }
      </CardFooter>
    </Card>
  );
}
