import styled, { css } from 'styled-components'

interface ActionBtnProps {
  $withText?: boolean
}

export const ActionBtn = styled.div<ActionBtnProps>`
  position: relative;
  z-index: 2;
  margin-right: ${({ theme }) => theme.core.space.space150};

  ${({ $withText, theme }) =>
    $withText &&
    css`
      margin-right: ${theme.core.space.space100};
    `}
`
