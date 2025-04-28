"use client"

import React from "react";
import { ServiceId, services } from "@/lib/services";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

function ServiceSelect({ options, value, onChange }: { options: ServiceId[], value: ServiceId | null, onChange: (value: ServiceId) => void }) {
  return (
    <Select onValueChange={onChange} value={value || ''}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select target streamer" />
      </SelectTrigger>
      <SelectContent>
        {options.map((id) => {
          const Icon = services[id].icon
          const name = services[id].name

          return (
            <SelectItem key={id} value={id}>
              <div className="flex items-center">
                <Icon className="mr-2 h-4 w-4" />
                <span>{name}</span>
              </div>
            </SelectItem>
          )
        })}
      </SelectContent>
    </Select>
  )
}

export default ServiceSelect