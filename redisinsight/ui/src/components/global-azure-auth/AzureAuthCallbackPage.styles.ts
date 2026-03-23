import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const PageWrapper = styled(Col)`
  height: 100vh;
  width: 100vw;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const ContentWrapper = styled.div`
  text-align: center;
`
