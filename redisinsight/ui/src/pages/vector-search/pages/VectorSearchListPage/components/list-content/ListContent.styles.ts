import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const ContentArea = styled(Row)`
  min-height: 0;
  flex: 1;
`

export const TableWrapper = styled(Col)`
  /* Inset so the table card chrome (rounded corners / shadow) is not
     clipped by the scrollport below */
  padding: 2px;
  min-width: 0;
  /* Bound the height to the resizable panel so the list scrolls
     instead of overflowing, matching the database list scroll fix */
  height: 100%;
  overflow: auto;
`
