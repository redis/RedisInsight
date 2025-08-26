import styled from 'styled-components'
import { Card } from 'uiSrc/components/base/layout'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const StyledCard = styled(Card)<{ backgroundImage: string }>`
  height: 100%;
  justify-content: center;
  align-items: center;
  position: relative;
  background-image: ${({ backgroundImage }) =>
    backgroundImage ? `url(${backgroundImage})` : 'none'};

  background-repeat: no-repeat;
  background-position: left ${({ theme }) => theme.core.space.space150} bottom
    ${({ theme }) => theme.core.space.space150};
  background-size: auto 238px;
`

export const StyledCardBody = styled(FlexGroup)`
  flex: 0 0 auto;
  max-width: 520px;
  height: fit-content;
  align-items: center;
`

export const StyledCardDescription = styled(FlexGroup)`
  align-items: center;
  text-align: center;
`
