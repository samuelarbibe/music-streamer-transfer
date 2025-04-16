"use client"

import React, { useState } from "react"

import { ModeToggle } from "@/components/ui/mode-toggle"

import ColourfulText from "@/components/ui/colourful-text"
import LoginStep from "@/components/steps/login-step"
import PlaylistSelectionStep from "@/components/steps/playlist-selection-step"
import TransferStep from "@/components/steps/transfer-step"
import { ServiceId, sourceServiceIdAtom, targetServiceIdAtom } from "@/lib/services"
import { useAtom } from "jotai/react"

export interface IStepProps {
  sourceServiceId: ServiceId,
  targetServiceId: ServiceId,
  handleContinue: () => void
  handleBack: () => void
}

const stepComponents = [
  PlaylistSelectionStep,
  TransferStep
]

export default function TransferPage() {
  const [step, setStep] = useState(0)
  const [sourceServiceId] = useAtom(sourceServiceIdAtom)
  const [targetServiceId] = useAtom(targetServiceIdAtom)

  const StepComponent = stepComponents[step - 1]

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

      {
        sourceServiceId && targetServiceId && step >= 1
          ? (
            <StepComponent
              sourceServiceId={sourceServiceId}
              targetServiceId={targetServiceId}
              handleContinue={() => setStep(prev => prev + 1)}
              handleBack={() => setStep(prev => prev - 1)}
            />
          )
          : <LoginStep handleContinue={() => setStep(prev => prev + 1)}
          />
      }

      <div className="absolute top-4 right-4">
        <ModeToggle />
      </div>
    </div>
  )
}
