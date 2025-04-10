"use client"

import React, { useRef } from "react"

import { Button } from "@/components/ui/button"

import { ServiceId, services, sourceServiceIdAtom, targetServiceIdAtom, useIsLoggedInWith } from "@/lib/services"
import ServiceSelect from "@/components/ui/service-select"
import { ModeToggle } from "@/components/ui/mode-toggle"
import Service from "@/components/services"

import { useAtom } from "jotai/react"
import { AnimatedBeam } from "@/components/magicui/animated-beam"
import ColourfulText from "@/components/ui/colourful-text"

export default function TransferPage() {
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [sourceServiceId, setSourceServiceId] = useAtom(sourceServiceIdAtom)
  const [targetServiceId, setTargetServiceId] = useAtom(targetServiceIdAtom)

  const isSourceServiceLoggedIn = useIsLoggedInWith(sourceServiceId)
  const isTargetServiceLoggedIn = useIsLoggedInWith(targetServiceId)

  const handleClear = () => {
    setSourceServiceId(null)
    setTargetServiceId(null)
  }

  return (
    <div className="container mx-auto max-w-3xl min-h-screen flex flex-col items-center justify-center gap-10 px-5 py-30 md:pt-0">
      <h1 className="text-6xl font-bold text-center flex flex-col md:flex-row gap-4">
        <div>
          Transfer your
        </div>
        <div>
          <ColourfulText text="Music" />
        </div>
      </h1>

      <div ref={containerRef} className="w-full flex flex-col md:flex-row relative gap-12">
        {
          sourceServiceId && targetServiceId && (
            <AnimatedBeam
              className="-z-999"
              delay={0}
              pathWidth={4}
              toRef={targetRef}
              fromRef={sourceRef}
              containerRef={containerRef}
            />
          )
        }

        <div className="flex flex-col flex-1 space-y-5">
          <h2 className="text-lg font-medium">Source</h2>
          <ServiceSelect
            value={sourceServiceId}
            onChange={setSourceServiceId}
            options={(Object.keys(services) as ServiceId[]).filter(option => option !== targetServiceId)}
          />

          {sourceServiceId &&
            <Service ref={sourceRef} serviceId={sourceServiceId} />
          }
        </div>

        <div className="flex flex-col flex-1 space-y-5">
          <h2 className="text-lg font-medium">Target</h2>
          <ServiceSelect
            value={targetServiceId}
            onChange={setTargetServiceId}
            options={(Object.keys(services) as ServiceId[]).filter(option => option !== sourceServiceId)}
          />
          {
            targetServiceId &&
            <Service ref={targetRef} serviceId={targetServiceId} />
          }
        </div>
      </div>

      <div className="flex flex-row w-full items-center justify-center gap-3">
        <Button variant='outline' size="lg" disabled={!sourceServiceId && !targetServiceId} onClick={handleClear}>
          Clear
        </Button>
        <Button size="lg" disabled={!isSourceServiceLoggedIn || !isTargetServiceLoggedIn}>
          Continue
        </Button>
      </div>
      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
    </div>
  )
}
