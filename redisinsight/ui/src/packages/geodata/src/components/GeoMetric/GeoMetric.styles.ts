import styled from 'styled-components'

import { Card } from 'uiSrc/components/base/layout/card'
import { Text } from 'uiSrc/components/base/text'

export const Panel = styled(Card)`
  width: fit-content;
  min-width: ${({ theme }) => theme.core.space.space800};
  padding: ${({ theme }) => theme.core.space.space200};
  border: none;
  box-shadow: 0 0 0 1px
    ${({ theme }) => theme.semantic.color.border.neutral600};
`

export const Label = styled(Text)`
  text-transform: uppercase;
`
