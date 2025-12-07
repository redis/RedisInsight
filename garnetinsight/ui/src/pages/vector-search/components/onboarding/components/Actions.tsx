import React from 'react'

import { EmptyButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import useStartWizard from 'uiSrc/pages/vector-search/hooks/useStartWizard'
import { StyledActions } from '../VectorSearchOnboarding.styles'
import { useVectorSearchOnboarding } from 'uiSrc/pages/vector-search/context/VectorSearchOnboardingContext'

const Actions: React.FC = () => {
  const startOnboardingWizard = useStartWizard()
  const { setOnboardingSeen } = useVectorSearchOnboarding()

  const handleExploreClick = () => {
    startOnboardingWizard()
  }

  const handleSkipClick = () => {
    setOnboardingSeen()
  }

  return (
    <StyledActions
      direction="column"
      justify="center"
      align="center"
      gap="l"
      grow={false}
      data-testid="vector-search-onboarding--actions"
    >
      <PrimaryButton size="l" onClick={handleExploreClick}>
        Explore vector search
      </PrimaryButton>
      <EmptyButton onClick={handleSkipClick}>Skip for now</EmptyButton>
    </StyledActions>
  )
}

export default Actions
