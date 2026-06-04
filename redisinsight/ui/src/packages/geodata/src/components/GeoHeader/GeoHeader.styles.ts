import styled from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const Header = styled(Row)`
  width: 100%;
  padding-bottom: ${({ theme }) => theme.core.space.space150};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

export const Label = styled(Text)`
  text-transform: uppercase;
`
