import styled from 'styled-components'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { Table, TableProps } from 'uiSrc/components/base/layout/table'
import { ArrayDataElement } from 'uiSrc/slices/interfaces/array'

export const Container = styled(FlexItem)`
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.core?.space.space200};
`

// `styled(Table)` widens the row generic to `object` and drops the
// `ArrayDataElement`-typed expansion callbacks; the trailing cast pins it back.
export const StyledTable = styled(Table)`
  scrollbar-width: thin;
  max-height: 100%;
  box-shadow: 0px 0px 0px 1px
    ${({ theme }) => theme.semantic.color.border.neutral500};

  [data-role='table-scroller'] {
    scrollbar-width: thin;
  }
` as unknown as (props: TableProps<ArrayDataElement>) => JSX.Element
