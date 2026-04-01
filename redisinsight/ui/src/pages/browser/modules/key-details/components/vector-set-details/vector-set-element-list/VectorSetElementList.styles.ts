import styled from 'styled-components'
import { Table } from 'uiSrc/components/base/layout/table'
import { FlexItem } from 'uiSrc/components/base/layout/flex'

export const Container = styled(FlexItem)`
  display: flex;
  flex: 1;
  width: 100%;
  overflow: hidden;
  padding: ${({ theme }) => theme.core?.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic?.color.background.neutral100};
`

export const StyledTable = styled(Table)`
  max-height: 100%;

  [data-role='table-scroller'] {
    scrollbar-width: thin;
  }
`
