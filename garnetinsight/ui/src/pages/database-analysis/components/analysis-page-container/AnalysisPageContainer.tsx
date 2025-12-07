import React from 'react'
import { StyledAnalysisPageContainer } from './AnalysisPageContainer.styles'
import { AnalysisPageContainerProps } from './AnalysisPageContainer.types'

export const AnalysisPageContainer = ({
  children,
  ...rest
}: AnalysisPageContainerProps) => (
  <StyledAnalysisPageContainer {...rest}>
    {children}
  </StyledAnalysisPageContainer>
)
