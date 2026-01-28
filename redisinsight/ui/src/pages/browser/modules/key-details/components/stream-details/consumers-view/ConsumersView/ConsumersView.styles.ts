import styled from 'styled-components'

export const Container = styled.div`
  display: flex;
  flex: 1;
  width: 100%;
  padding-top: 3px;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`
