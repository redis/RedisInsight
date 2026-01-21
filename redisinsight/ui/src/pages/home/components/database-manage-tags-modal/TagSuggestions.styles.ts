import styled from 'styled-components'

export const SuggestionsListWrapper = styled.div<{ children: React.ReactNode }>`
  position: absolute;
  background: ${({ theme }) => theme.semantic.color.background.neutral100};
  border: 1px solid ${({ theme }) => theme.semantic.color.border.neutral500};
  border-radius: ${({ theme }) => theme.core.space.space050};
  overflow-y: auto;
  width: 100%;
  max-height: 225px;

  div[data-role='heading'] {
    padding: ${({ theme }) => theme.core.space.space150};
  }

  ul {
    li {
      cursor: pointer;
      padding: ${({ theme }) => theme.core.space.space150};
    }

    li:hover {
      background: ${({ theme }) => theme.semantic.color.background.neutral300};
    }
  }
`
