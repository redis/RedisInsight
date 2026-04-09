import styled from 'styled-components'
import { Table } from 'uiSrc/components/base/layout/table'
import { FlexItem } from 'uiSrc/components/base/layout/flex'
import { TextButton } from 'uiSrc/components/base/forms/buttons'

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

  [data-role='pagination'] {
    scrollbar-width: thin;
    border-top: 1px solid
      ${({ theme }) => theme.semantic.color.border.neutral500};
  }
`

export const StyledTextButton = styled(TextButton)`
  margin-top: ${({ theme }) => theme.core.space.space025};
  color: ${({ theme }) => theme.semantic.color.text.informative400};
`
