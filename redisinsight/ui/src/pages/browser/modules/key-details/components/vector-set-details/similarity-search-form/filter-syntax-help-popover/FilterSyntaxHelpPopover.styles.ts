import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'

export const HelpPopoverContainer = styled(Col)`
  gap: 8px;
  max-width: 320px;
  padding: 4px;
`

export const HelpExampleList = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.core.space.space300};
  font-family: 'Source Code Pro', Menlo, Consolas, monospace;
  font-size: 12px;
`
