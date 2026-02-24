import styled from 'styled-components'
import { Col, Row } from 'uiSrc/components/base/layout/flex'

export const Container = styled(Col)`
  flex: 1;
  min-height: 0;
  overflow: hidden;
`

export const SearchBar = styled(Row)`
  padding: ${({ theme }) =>
    `${theme.core.space.space150} ${theme.core.space.space200}`};
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral400};
  flex-grow: 0;
  flex-shrink: 0;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral200};

  & > * {
    flex: 1;
    min-width: 0;
  }
`

export const ListContainer = styled(Col)`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
`

export const EmptyState = styled(Col)`
  flex: 1;
  padding: ${({ theme }) => theme.core.space.space500};
  color: ${({ theme }) => theme.semantic.color.text.neutral700};
  text-align: center;
`

export const LoadingWrapper = styled(Col)`
  padding: ${({ theme }) => theme.core.space.space500};
`