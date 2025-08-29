import styled from 'styled-components'
import { Card } from 'uiSrc/components/base/layout'
import { FlexGroup } from 'uiSrc/components/base/layout/flex'

export const StyledCard = styled(Card)`
  height: 100%;
  justify-content: center;
  align-items: center;
  position: relative;
`

export const StyledCardBody = styled(FlexGroup)`
  flex: 0 0 auto;
  max-width: 600px;
  height: fit-content;
  align-items: center;
`
