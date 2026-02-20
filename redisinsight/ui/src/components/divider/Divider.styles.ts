import { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { StyledDividerProps } from './Divider.types'

const dividerStyles = {
  orientation: {
    horizontal: 'width: 100%; height: 1px;',
    vertical: 'width: 1px; height: 100%;',
  },
  variant: {
    fullWidth: {
      horizontal: '',
      vertical: '',
    },
    half: {
      horizontal: 'width: 50%;',
      vertical: 'height: 50%;',
    },
  },
}

export const DividerWrapper = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const Divider = styled.hr<StyledDividerProps>`
  border: none;
  background-color: ${({
    theme,
    $color = theme.semantic.color.background.neutral500,
  }) => $color};

  ${({ $orientation = 'horizontal' }) =>
    dividerStyles.orientation[$orientation]}
  ${({ $variant = 'fullWidth', $orientation = 'horizontal' }) =>
    dividerStyles.variant[$variant][$orientation]}
`
