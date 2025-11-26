import React from 'react'

import { PrimaryButton } from 'uiSrc/components/base/forms/buttons'
import { Card } from 'uiSrc/components/base/layout'
import CreateTutorialLink from '../CreateTutorialLink'
import { StyledRow, TutorialText } from './WelcomeMyTutorials.styles'

export interface Props {
  handleOpenUpload: () => void
}

const WelcomeMyTutorials = ({ handleOpenUpload }: Props) => (
  <Card data-testid="welcome-my-tutorials">
    <StyledRow justify="around">
      <CreateTutorialLink />
      <PrimaryButton
        size="s"
        onClick={() => handleOpenUpload()}
        data-testid="upload-tutorial-btn"
      >
        + Upload <TutorialText>tutorial</TutorialText>
      </PrimaryButton>
    </StyledRow>
  </Card>
)

export default WelcomeMyTutorials
