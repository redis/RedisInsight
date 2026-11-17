import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'
import { SearchInput } from 'uiSrc/components/base/inputs'

export const HeaderRow = styled(Row).attrs({ grow: false })`
  align-items: center;
`

// Fixed width so the reset button appearing on input does not resize the field
export const IndexSearchInput = styled(SearchInput)`
  width: calc(${({ theme }) => theme.core.space.space550} * 6); // 264px
`

export const PageLayout = styled(Col).attrs({ gap: 'l' })`
  min-height: 0;
  min-width: 0;
  overflow: hidden;
`
