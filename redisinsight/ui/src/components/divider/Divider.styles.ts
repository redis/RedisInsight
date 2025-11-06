import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

export type DividerVariant = 'fullWidth' | 'half'
export type DividerOrientation = 'horizontal' | 'vertical'

const dividerStyles = {
  orientation: {
    horizontal: css`
      width: 100%;
      height: 1px;
    `,
    vertical: css`
      width: 1px;
      height: 100%;
    `,
  },
  variant: {
    fullWidth: {
      horizontal: css``,
      vertical: css``,
    },
    half: {
      horizontal: css`
        width: 50%;
      `,
      vertical: css`
        height: 50%;
      `,
    },
  },
}

export interface StyledDividerProps extends HTMLAttributes<HTMLHRElement> {
  $color?: string
  $orientation?: DividerOrientation
  $variant?: DividerVariant
}

export const StyledDividerWrapper = styled.div<HTMLAttributes<HTMLDivElement>>`
  display: flex;
  align-items: center;
  justify-content: center;
`

export const StyledDivider = styled.hr<StyledDividerProps>`
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
