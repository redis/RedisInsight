import { HTMLAttributes } from 'react'
import styled from 'styled-components'

export const Wrapper = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: relative;
  width: 100%;
`

export const SuggestionsPanel = styled.div<HTMLAttributes<HTMLDivElement>>`
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  z-index: 10;
  background: ${({ theme }) => theme.semantic.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space050};
  box-shadow: ${({ theme }) => theme.core.shadow.shadow700};
  overflow: hidden;
`

export const SuggestionsHint = styled.div<HTMLAttributes<HTMLDivElement>>`
  padding: ${({ theme }) =>
    `${theme.core.space.space050} ${theme.core.space.space100}`};
  color: ${({ theme }) => theme.semantic.color.text.neutral500};
  font-size: 12px;
  border-bottom: 1px solid
    ${({ theme }) => theme.semantic.color.border.neutral500};
`

export const SuggestionsList = styled.ul<HTMLAttributes<HTMLUListElement>>`
  margin: 0;
  padding: 4px 0;
  list-style: none;
  max-height: 200px;
  overflow-y: auto;
`

export const SuggestionItem = styled.li<
  HTMLAttributes<HTMLLIElement> & { $active: boolean }
>`
  padding: ${({ theme }) =>
    `${theme.core.space.space050} ${theme.core.space.space100}`};
  cursor: pointer;
  color: ${({ theme }) => theme.semantic.color.text.neutral800};
  background: ${({ theme, $active }) =>
    $active ? theme.semantic.color.background.neutral400 : 'transparent'};

  &:hover {
    background: ${({ theme }) => theme.semantic.color.background.neutral400};
  }
`
