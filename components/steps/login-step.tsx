import { ServiceId, services, serviceSessionsAtom, sourceServiceIdAtom, targetServiceIdAtom } from "@/lib/services"
import { useAtom, useSetAtom } from "jotai/react"
import { useEffect, useRef } from "react"
import { AnimatedBeam } from "../magicui/animated-beam"
import LoginCard from "../services/login-card"
import ServiceSelect from "../ui/service-select"
import { Button } from "../ui/button"
import { useSession } from "next-auth/react"

const useSyncSessionStateToLocalStorage = () => {
  const { data } = useSession()
  const setSessionsAtom = useSetAtom(serviceSessionsAtom)

  useEffect(() => {
    if (!data) return

    setSessionsAtom((prev) => ({
      ...prev,
      [data.provider]: data
    }))
  }, [data, setSessionsAtom])
}

interface LoginStepProps {
  handleContinue: () => void
}

export default function LoginStep(props: LoginStepProps) {
  const sourceRef = useRef<HTMLDivElement | null>(null)
  const targetRef = useRef<HTMLDivElement | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const [sourceServiceId, setSourceServiceId] = useAtom(sourceServiceIdAtom)
  const [targetServiceId, setTargetServiceId] = useAtom(targetServiceIdAtom)

  useSyncSessionStateToLocalStorage()

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
        <Button
          size="lg"
          onClick={props.handleContinue}
        // disabled={!isSourceServiceLoggedIn || !isTargetServiceLoggedIn}
        >
          Continue
        </Button>
      </div>
    </>
  )
}