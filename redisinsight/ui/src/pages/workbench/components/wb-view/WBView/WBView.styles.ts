import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  flex-grow: 1;
  max-height: 100%;
`

export const Main = styled.div`
  display: flex;
  flex: 1;
  padding: 0 ${({ theme }) => theme.core.space.space200} 0;
  height: 100%;
  width: 100%;
`

export const Content = styled.div`
  display: flex;
  flex-grow: 1;
  width: 100%;
`
