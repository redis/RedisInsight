import styled from 'styled-components'
import { HTMLAttributes } from 'react'

export const Container = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  flex: 1;
  width: 100%;
  padding: ${({ theme }) => theme.core.space.space200};
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`
