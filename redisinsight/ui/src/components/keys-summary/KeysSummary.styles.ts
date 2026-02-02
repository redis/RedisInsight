import styled, { css } from 'styled-components'

export const Loading = styled.span<{ $show?: boolean }>`
  opacity: 0;

  ${({ $show }) =>
    $show &&
    css`
      opacity: 1;
    `}
`
