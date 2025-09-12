import React, { useEffect } from 'react'
import { TelemetryEvent } from 'uiSrc/telemetry'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import useVectorSearchOnboarding from '../../create-index/hooks/useVectorSearchOnboarding'
import { useTelemetryMountEvent } from '../../hooks/useTelemetryMountEvent'
import {
  Content,
  DismissAction,
  MagnifierImage,
  StyledVectorSearchOnboarding,
} from './VectorSearchOnboarding.styles'
import Features from './components/Features'
import Header from './components/Header'
import Actions from './components/Actions'
import Footer from './components/Footer'
import Stepper from './components/Stepper'

export const VectorSearchOnboarding = () => {
  useTelemetryMountEvent(TelemetryEvent.VECTOR_SEARCH_INITIAL_MESSAGE_DISPLAYED)

  const { markOnboardingAsSeen } = useVectorSearchOnboarding()

  useEffect(() => {
    markOnboardingAsSeen()
  }, [])

  return (
    <StyledVectorSearchOnboarding
      direction="column"
      data-testid="vector-search-onboarding"
    >
      <DismissAction>
        <IconButton
          icon="CancelIcon"
          onClick={markOnboardingAsSeen}
          data-testid="vector-search-onboarding--dismiss-button"
        />
      </DismissAction>

      <Content
        grow={true}
        direction="column"
        justify="center"
        align="center"
        gap="xxl"
      >
        <Header />
        <Features />
        <Stepper />
        <Actions />
      </Content>

      <Footer />

      <MagnifierImage />
    </StyledVectorSearchOnboarding>
  )
}
