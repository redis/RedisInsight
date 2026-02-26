import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

export const HeaderRow = styled(Row).attrs({
  align: 'center',
  justify: 'between',
  grow: false,
})`
  width: 100%;
  flex-shrink: 0;
`
