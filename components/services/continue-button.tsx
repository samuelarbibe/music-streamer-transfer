import { ServiceId, useIsServiceAuthenticated } from "@/lib/services";
import { Button } from "../ui/button";

interface ContinueButtonProps {
  sourceServiceId: ServiceId
  targetServiceId: ServiceId
  handleContinue: () => void
}

export default function ContinueButton({ sourceServiceId, targetServiceId, handleContinue }: ContinueButtonProps) {
  const { data: isSourceServiceLoggedIn } = useIsServiceAuthenticated(targetServiceId)
  const { data: isTargetServiceLoggedIn } = useIsServiceAuthenticated(sourceServiceId)

  return (
    <Button
      size="lg"
      onClick={handleContinue}
      disabled={!isSourceServiceLoggedIn || !isTargetServiceLoggedIn}
    >
      Continue
    </Button>
  )
}