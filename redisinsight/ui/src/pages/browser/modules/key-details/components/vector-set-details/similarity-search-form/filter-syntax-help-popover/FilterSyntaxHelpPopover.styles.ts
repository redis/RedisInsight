import styled from 'styled-components'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const HelpPopoverContainer = styled(Col)`
  max-width: 320px;
`

export const HelpExampleList = styled.ul`
  margin: 0;
  padding-left: ${({ theme }) => theme.core.space.space300};
`

export const StyledExampleText = styled(Text)`
  font-family: 'Source Code Pro', Menlo, Consolas, monospace;
`
