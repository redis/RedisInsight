import styled from 'styled-components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const InfoIconWrapper = styled(FlexItem).attrs({ grow: false })`
  margin-left: auto;
  align-items: center;
  padding: 0 ${({ theme }) => theme.core?.space?.space200};
`

export const TreeWrapper = styled(Col)`
  overflow: hidden;
`

export const ErrorWrapper = styled(Col).attrs({
  contentCentered: true,
})`
  overflow: auto;
  padding: ${({ theme }) => theme.core?.space?.space200};
`
