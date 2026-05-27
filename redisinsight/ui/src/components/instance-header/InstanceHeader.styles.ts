import React from 'react'
import styled, { css } from 'styled-components'

import { FlexItem } from 'uiSrc/components/base/layout/flex'

interface InstanceHeaderContainerProps
  extends React.HTMLAttributes<HTMLDivElement> {
  $isProductionEnv?: boolean
}

const productionTint = css`
  background-color: ${({ theme }) => theme.semantic.color.background.danger100};
`

export const InstanceHeaderContainer = styled.div<InstanceHeaderContainerProps>`
  ${({ $isProductionEnv }) => $isProductionEnv && productionTint}
`

export const EnvironmentBadgeSlot = styled(FlexItem)`
  padding-left: 8px;

  &:empty {
    display: none;
  }
`
