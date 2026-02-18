import styled from 'styled-components'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled.div`
  height: 100%;
  overflow: hidden;
`

export const TabsRow = styled(Row).attrs({ align: 'end', grow: true })`
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic?.color?.border?.neutral500};
`

export const TabsWrapper = styled(FlexItem)`
  min-width: 0;
`

export const InfoIconWrapper = styled(Col).attrs({
  grow: false,
  align: 'center',
})`
  padding: 0 ${({ theme }) => theme.core?.space?.space200};
  padding-bottom: ${({ theme }) => theme.core?.space?.space100};
`
