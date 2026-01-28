import styled, { css } from 'styled-components'

export const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`

export const Content = styled.div<{ $isActive?: boolean }>`
  height: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
  position: relative;

  > div {
    height: 100%;
  }

  ${({ $isActive }) =>
    $isActive &&
    css`
      border-color: ${({ theme }) => theme.semantic.color.border.informative};
      border-bottom-width: 1px;
    `}
`
