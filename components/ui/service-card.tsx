"use client"

import React from "react";
import { ServiceId, services, useIsServiceAuthenticated, useServiceProfile } from "@/lib/services";
import { Button } from "./button";
import { Check, Lock } from "lucide-react";
import { Card } from "./card";

type ServiceCardProps = {
  serviceId: ServiceId;
  handleLogin: () => void;
  handleLogout: () => void;
};

export default function ServiceCard({ serviceId, handleLogin, handleLogout }: ServiceCardProps) {
  const { data: profile } = useServiceProfile(serviceId);
  const { data: isAuthenticated } = useIsServiceAuthenticated(serviceId)

  return (
    <Card className="flex-1 flex-row md:flex-col bg-card p-3 md:p-4 items-center">
      <div className="hidden md:flex flex-row gap-4 self-start">
        <div className="size-7">
          {React.createElement(services[serviceId].icon, { className: "size-7" })}
        </div>
        <span className="text-lg">
          {services[serviceId].name}
        </span>
      </div>
      <div className="rounded-full bg-muted ph-mask">
        {
          profile
            ? profile.imageUrl
              ? <img src={profile.imageUrl} className="size-10 md:size-15 rounded-full max-w-none" />
              : <Check className={"size-5 md:size-7 m-2 md:m-4"} />
            : <Lock className={"size-5 md:size-7 m-2 md:m-4"} />
        }
      </div>
      <p className="text-center text-sm text-muted-foreground ph-mask">
        {
          isAuthenticated && profile
            ? `Logged in as ${profile.name}`
            : `Please log in to view your ${services[serviceId].name} details`
        }
      </p>
      <div className="flex-1" />
      <div>
        {
          isAuthenticated
            ? <Button variant='outline' onClick={handleLogout}>Logout</Button>
            : <Button onClick={handleLogin}>Login</Button>
        }
      </div>
    </Card>
  );
}
