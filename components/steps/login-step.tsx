import { ServiceId, services, sourceServiceIdAtom, targetServiceIdAtom } from "@/lib/services"
import { useAtom } from "jotai/react"
import LoginCard from "../services/login-card"
import ServiceSelect from "../ui/service-select"
import { Button } from "../ui/button"
import ContinueButton from "../services/continue-button"

interface LoginStepProps {
  handleContinue: () => void
}

export default function LoginStep(props: LoginStepProps) {
  const [sourceServiceId, setSourceServiceId] = useAtom(sourceServiceIdAtom)
  const [targetServiceId, setTargetServiceId] = useAtom(targetServiceIdAtom)

  const handleClear = () => {
    setSourceServiceId(null)
    setTargetServiceId(null)
  }

  return (
    <>
      <div className="w-full flex flex-col md:flex-row relative gap-6">
        <div className="flex flex-col flex-1 space-y-3">
          <h2 className="text-xl font-medium">Source</h2>
          <ServiceSelect
            value={sourceServiceId}
            onChange={setSourceServiceId}
            options={(Object.keys(services) as ServiceId[]).filter(option => option !== targetServiceId)}
          />

          {sourceServiceId &&
            <LoginCard serviceId={sourceServiceId} />
          }
        </div>

        <div className="flex flex-col flex-1 space-y-3">
          <h2 className="text-xl font-medium">Target</h2>
          <ServiceSelect
            value={targetServiceId}
            onChange={setTargetServiceId}
            options={(Object.keys(services) as ServiceId[]).filter(option => option !== sourceServiceId)}
          />
          {
            targetServiceId &&
            <LoginCard serviceId={targetServiceId} />
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