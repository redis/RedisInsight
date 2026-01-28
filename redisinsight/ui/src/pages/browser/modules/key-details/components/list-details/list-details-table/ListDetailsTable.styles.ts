import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  padding: ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const InlineItemEditor = styled.div`
  max-width: calc(100% - 20px);
`
