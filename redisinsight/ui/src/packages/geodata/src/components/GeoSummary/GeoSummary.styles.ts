import styled from 'styled-components'

import { Card } from 'uiSrc/components/base/layout/card'
import { Col } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const Panel = styled(Card)`
  padding: ${({ theme }) => theme.core.space.space150};
  border: none;
  box-shadow: 0 0 0 1px
    ${({ theme }) => theme.semantic.color.border.neutral600};
`

export const Item = styled(Col)`
  min-width: 0;
`

export const Label = styled(Text)`
  text-transform: uppercase;
`
