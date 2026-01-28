import styled from 'styled-components'
import { HTMLAttributes } from 'react'

export const Page = styled.div`
  height: 100%;
  overflow: hidden;
`

export const Content = styled.div`
  width: 100%;
  height: 100%;
  background-color: ${({ theme }) =>
    theme.semantic.color.background.neutral100};
`

export const TableContainer = styled.div<HTMLAttributes<HTMLDivElement>>`
  height: 100%;
`
