import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const ChannelColumn = styled(Col)`
  // There are 2 columns next to each other.
  // The channel one doesn't grow, but it should have a minimum width.
  min-width: 250px;
`
