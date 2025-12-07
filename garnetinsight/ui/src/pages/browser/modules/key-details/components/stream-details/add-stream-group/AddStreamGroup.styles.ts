import styled from 'styled-components'
import { Col, FlexItem } from 'uiSrc/components/base/layout/flex'
import { RiIcon } from 'uiSrc/components/base/icons'

export const TimeStampWrapper = styled(FlexItem).attrs({ grow: true })`
  min-width: 225px;
`
export const TimeStampInfoIcon = styled(RiIcon).attrs({ type: 'InfoIcon' })`
  cursor: pointer;
`

export const StreamGroupContent = styled(Col)`
  max-height: calc(50vh - 100px);
  scroll-padding-bottom: 30px;
`
