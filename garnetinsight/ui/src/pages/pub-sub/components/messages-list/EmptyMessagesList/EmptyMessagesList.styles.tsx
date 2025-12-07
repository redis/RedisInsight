import styled from 'styled-components'
import { RiImage } from 'uiSrc/components/base/display'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'

export const HeroImage = styled(RiImage)`
  user-select: none;
  pointer-events: none;
`

export const InnerContainer = styled(Col)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  border-radius: ${({ theme }) => theme.core.space.space100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  padding: ${({ theme }) => theme.core.space.space300};
  height: 100%;
`

export const Wrapper = styled(FlexItem)`
  margin: ${({ theme }) =>
    `${theme.core.space.space050} ${theme.core.space.space200}`};
  height: 100%;
`
