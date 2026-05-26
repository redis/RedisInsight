import React from 'react'
import styled, { css } from 'styled-components'

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
