import { HTMLAttributes } from 'react'

export type DividerVariant = 'fullWidth' | 'half'
export type DividerOrientation = 'horizontal' | 'vertical'

export interface DividerProps {
  orientation?: DividerOrientation
  variant?: DividerVariant
  color?: string
  className?: string
}

export interface StyledDividerProps extends HTMLAttributes<HTMLHRElement> {
  $color?: string
  $orientation?: DividerOrientation
  $variant?: DividerVariant
}
