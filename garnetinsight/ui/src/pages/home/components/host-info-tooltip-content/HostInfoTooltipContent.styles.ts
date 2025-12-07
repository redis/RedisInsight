import { HTMLAttributes } from 'react'
import styled from 'styled-components'

export const StyledUrlList = styled.ul<HTMLAttributes<HTMLUListElement>>`
  margin-top: ${({ theme }) => theme.core.space.space050};
  padding-left: ${({ theme }) => theme.core.space.space400};
`

export const StyledUrlItem = styled.li<HTMLAttributes<HTMLLIElement>>`
  font-weight: 300;
  opacity: 0.85;
  list-style: disc;
`
