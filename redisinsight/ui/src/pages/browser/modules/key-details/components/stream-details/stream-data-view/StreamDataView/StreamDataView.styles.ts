import styled from 'styled-components'
import { HTMLAttributes } from 'react'

export const Container = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  flex: 1;
  width: 100%;
  height: 100%;
  position: relative;
  padding-top: 3px;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`
