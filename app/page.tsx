"use client"

import React, { useState } from "react"

import { ModeToggle } from "@/components/ui/mode-toggle"

import LoginStep from "@/components/steps/login-step"
import PlaylistSelectionStep from "@/components/steps/playlist-selection-step"
import TransferStep from "@/components/steps/transfer-step"
import { ServiceId, services, sourceServiceIdAtom, targetServiceIdAtom } from "@/lib/services"
import { useAtom } from "jotai/react"
import { ArrowRight } from "lucide-react"
import { TypingAnimation } from "@/components/magicui/typing-animation"

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
    <div className="container mx-auto max-w-3xl min-h-screen flex flex-col items-center justify-center gap-10 px-5 pt-20 md:pt-0">
      <div className="font-bold text-center flex flex-col gap-2 items-center">
        <span className="text-4xl">Transfer your Music</span>
        <div className="flex flex-row items-center text-neutral-500">
          {
            sourceServiceId &&
            <>
              <TypingAnimation duration={50} className="text-xl md:text-2xl">{services[sourceServiceId].name}</TypingAnimation>
              <ArrowRight className="font-medium mx-2" />
            </>
          }
          {
            targetServiceId &&
            <>
              <TypingAnimation duration={50} className="text-xl md:text-2xl">{services[targetServiceId].name}</TypingAnimation>
            </>
          }
        </div>
      </div>

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
