import React from 'react'
import { StyledCard, StyledCardBody } from './ReqNotAvailableCard.styles'
import { ModuleNotLoaded } from 'uiSrc/components'
import { RedisDefaultModules } from 'uiSrc/slices/interfaces'

export const RqeNotAvailableCard = () => {
  return (
    <StyledCard data-testid="rqe-not-available-card">
      <StyledCardBody direction="column" gap="xxl">
        <ModuleNotLoaded
          id="rqe-not-available"
          moduleName={RedisDefaultModules.Search}
          type="browser"
        />
      </StyledCardBody>
    </StyledCard>
  )
}
