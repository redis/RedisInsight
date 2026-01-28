import styled from 'styled-components'

export const Link = styled.a`
  text-decoration: underline;
  color: ${({ theme }) => theme.semantic.color.text.default};
`
