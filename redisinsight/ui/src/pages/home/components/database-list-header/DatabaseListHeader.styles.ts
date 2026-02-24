import styled from 'styled-components'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { insightsOpen } from 'uiSrc/styles/mixins'

export const Container = styled.div``

export const ContentRow = styled(Row)``

export const SpacerDl = styled(Spacer)`
  height: ${({ theme }) => theme.core.space.space150};

  @media screen and (max-width: 767px) {
    height: ${({ theme }) => theme.core.space.space100};
  }
`

export const Promo = styled(FlexItem)`
  display: flex;

  ${insightsOpen(1350)`
    display: none;
  `}
`
