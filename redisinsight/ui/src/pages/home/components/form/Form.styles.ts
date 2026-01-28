import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const DbInput = styled(FlexItem)``

export const AnchorEndpoints = styled.span`
  pointer-events: auto;

  svg {
    width: 24px;
    height: 24px;
  }
`

export const EndpointsList = styled.ul`
  * {
    font-weight: 300;
  }
`

export const SentinelCollapsedField = styled(Text)`
  padding: ${({ theme }) =>
    `${theme.core.space.space050} ${theme.core.space.space100}`};
  font-size: 13px;
  word-break: break-all;
`

export const FullWidth = styled(FlexItem)`
  flex-basis: 100%;
`
