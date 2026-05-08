import styled from 'styled-components'

import { Table } from 'uiSrc/components/base/layout/table'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

export const Container = styled(FlexItem)`
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.core?.space.space200};
`

export const StyledTable = styled(Table)`
  scrollbar-width: thin;
  max-height: 100%;
  box-shadow: 0px 0px 0px 1px
    ${({ theme }) => theme.semantic.color.border.neutral500};

  [data-role='table-scroller'] {
    scrollbar-width: thin;
  }
`

export const SimilarityCell = styled.span<{
  $isHigh?: boolean
  children: React.ReactNode
}>`
  font-variant-numeric: tabular-nums;
  color: ${({ theme, $isHigh }) =>
    $isHigh
      ? theme.semantic.color.text.success600
      : theme.semantic.color.text.neutral800};
`
