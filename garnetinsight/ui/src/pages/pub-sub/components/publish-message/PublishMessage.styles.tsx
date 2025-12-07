import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const ChannelColumn = styled(Col)`
  // There are 2 columns next to each other.
  // The channel one doesn't grow, but it should have a minimum width.
  min-width: 250px;
`

export const ButtonWrapper = styled(Row)`
  min-width: 100px;
`

export const ResultWrapper = styled(Row)`
  min-height: 36px;
`
