import styled, { css } from 'styled-components'
import { IndexDetailsContainerProps } from './IndexDetails.types'

export const IndexDetailsContainer = styled.div<IndexDetailsContainerProps>`
  width: 100%;

  ${({ $showBorder }) =>
    !$showBorder &&
    css`
      > div {
        box-shadow: none;
      }
    `}
`
