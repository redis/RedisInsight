import styled from 'styled-components'
import { HTMLAttributes } from 'react'

export const Container = styled.div<HTMLAttributes<HTMLDivElement>>`
  height: calc(100% - 94px);
  position: relative;
  padding: ${({ theme }) => theme.core.space.space200};
  overflow-y: auto;
`
