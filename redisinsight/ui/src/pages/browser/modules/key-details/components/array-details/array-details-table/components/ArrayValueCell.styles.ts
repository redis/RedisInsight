import styled from 'styled-components'
import { Text } from 'uiSrc/components/base/text'

export const EmptyValue = styled(Text)`
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
`
