import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'

export const Container = styled.div``

export const ContentRow = styled(Row)``

export const SpacerDl = styled(Spacer)`
  height: ${({ theme }) => theme.core.space.space150};
`

export const Promo = styled(FlexItem)`
  display: flex;

  @media only screen and (max-width: 800px) {
    display: none;
  }
`
