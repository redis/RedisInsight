import styled, { css } from 'styled-components'

interface InstanceHeaderContainerProps {
  $isProductionEnv?: boolean
}

const productionGradient = css`
  background: linear-gradient(
    90deg,
    ${({ theme }) => theme.semantic.color.background.danger200} 0%,
    ${({ theme }) => theme.semantic.color.background.danger100} 25%,
    transparent 60%
  );
`

export const InstanceHeaderContainer = styled.div<InstanceHeaderContainerProps>`
  ${({ $isProductionEnv }) => $isProductionEnv && productionGradient}
`
