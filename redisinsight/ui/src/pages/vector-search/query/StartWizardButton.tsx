import React from 'react'
import styled from 'styled-components'
import { CallOut } from 'uiSrc/components/base/display/call-out/CallOut'
import { Button } from 'uiSrc/components/base/forms/buttons'

const StyledButton = styled(Button)`
  margin-left: ${({ theme }) => theme.core.space.space150};
`

export const StartWizardButton = () => (
  <CallOut variant="success">
    Power fast, real-time semantic AI search with vector search.
    <StyledButton variant="secondary-ghost" size="small">
      Get started
    </StyledButton>
  </CallOut>
)
