import styled from 'styled-components'

import { Row } from 'uiSrc/components/base/layout/flex'
import { Text } from 'uiSrc/components/base/text'

export const SummaryContainer = styled(Row)`
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral300};
  padding: ${({ theme }) => theme.core.space.space200}
    ${({ theme }) => theme.core.space.space600};
  border-radius: ${({ theme }) => theme.core.space.space050};
`

export const SummaryValue = styled(Text)`
  line-height: 24px;
  font-weight: 500 !important;
`
