import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  overflow: auto;
  position: relative;
`
export const ContentWrapper = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space200};
`

export const LoadingState = styled(Col)`
  z-index: 2;
`
