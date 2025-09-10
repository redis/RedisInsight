import React, { useEffect } from 'react'
import { TelemetryEvent } from 'uiSrc/telemetry'
import useVectorSearchOnboarding from '../../create-index/hooks/useVectorSearchOnboarding'
import { useTelemetryMountEvent } from '../../hooks/useTelemetryMountEvent'

export const VectorSearchOnboarding = () => {
  useTelemetryMountEvent(TelemetryEvent.VECTOR_SEARCH_INITIAL_MESSAGE_DISPLAYED)

  const { markOnboardingAsSeen } = useVectorSearchOnboarding()

  useEffect(() => {
    markOnboardingAsSeen()
  }, [])

  return <div data-testid="vector-search-onboarding">Onboarding</div>
}
