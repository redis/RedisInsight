import React from 'react'
import { useHistory, useParams } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { EmptyButton, PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import useStartWizard from 'uiSrc/pages/vector-search/hooks/useStartWizard'
import { StyledActions } from '../VectorSearchOnboarding.styles'

const Actions: React.FC = () => {
  const history = useHistory()
  const { instanceId } = useParams<{ instanceId: string }>()
  const startOnboardingWizard = useStartWizard()

  const handleExploreClick = () => {
    startOnboardingWizard()
  }

  const handleSkipClick = () => {
    history.push(Pages.vectorSearch(instanceId))
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
