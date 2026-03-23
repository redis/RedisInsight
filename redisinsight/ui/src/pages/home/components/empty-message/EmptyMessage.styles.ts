import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  height: calc(100vh - 185px);
  gap: ${({ theme }) => theme.core.space.space200};
`

export const Icon = styled.img`
  width: 12rem;
`
