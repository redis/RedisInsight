import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled.div`
  height: 100%;
  overflow: hidden;
`

export const NoKeys = styled.div`
  text-align: center;
  margin: auto;
`

export const Content = styled(Col)`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  border-top: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
`
