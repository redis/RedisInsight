import styled from 'styled-components'
import { Row } from 'uiSrc/components/base/layout/flex'

// A compact toolbar that sits directly above the table (never grows to fill),
// padded to line up with the table's own content padding.
export const BarRow = styled(Row)`
  flex-shrink: 0;
  padding: ${({ theme }) => theme.core?.space.space100}
    ${({ theme }) => theme.core?.space.space200};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic?.color.border.neutral500};
`
