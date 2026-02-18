import styled from 'styled-components'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  height: 100%;
  overflow: hidden;
`

export const TabsRow = styled(Row).attrs({ grow: false })`
  position: relative;
  flex-shrink: 0;
  padding-left: ${({ theme }) => theme.core?.space?.space150};
`

export const InfoIconWrapper = styled(FlexItem).attrs({
  grow: false,
  align: 'center',
})`
  position: absolute;
  right: ${({ theme }) => theme.core?.space?.space200};
  bottom: ${({ theme }) => theme.core?.space?.space100};
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
