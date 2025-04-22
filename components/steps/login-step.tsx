import { ServiceId, services, sourceServiceIdAtom, targetServiceIdAtom } from "@/lib/services"
import { useAtom } from "jotai/react"
import { useRef } from "react"
import { AnimatedBeam } from "../magicui/animated-beam"
import LoginCard from "../services/login-card"
import ServiceSelect from "../ui/service-select"
import { Button } from "../ui/button"
import ContinueButton from "../services/continue-button"

interface LoginStepProps {
  handleContinue: () => void
}

export default function LoginStep(props: LoginStepProps) {
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [sourceServiceId, setSourceServiceId] = useAtom(sourceServiceIdAtom)
  const [targetServiceId, setTargetServiceId] = useAtom(targetServiceIdAtom)

  const handleClear = () => {
    setSourceServiceId(null)
    setTargetServiceId(null)
  }

  return (
    <>
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
            <LoginCard ref={sourceRef} serviceId={sourceServiceId} />
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
            <LoginCard ref={targetRef} serviceId={targetServiceId} />
          }
        </div>
      </div>
      <div className="flex flex-row w-full items-center justify-between md:justify-center gap-3">
        <Button
          size="lg"
          variant='outline'
          onClick={handleClear}
          disabled={!sourceServiceId && !targetServiceId}
        >
          Clear
        </Button>
        {
          sourceServiceId && targetServiceId &&
          <ContinueButton sourceServiceId={sourceServiceId} targetServiceId={targetServiceId} handleContinue={props.handleContinue} />
        }
      </div>
    </>
  )
}