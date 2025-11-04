import React from 'react'

import {
  StyledDividerWrapper,
  StyledDivider,
  DividerVariant,
  DividerOrientation,
} from './Divider.styles'

export interface DividerProps {
  orientation: DividerOrientation
  variant: DividerVariant
  color: string
  className: string
}

const Divider = ({
  orientation,
  variant,
  color,
  className,
  ...props
}: DividerProps) => (
  <StyledDividerWrapper {...props}>
    <StyledDivider
      $variant={variant}
      $orientation={orientation}
      $color={color}
    />
  </StyledDividerWrapper>
)

export default Divider
