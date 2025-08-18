import React from 'react'
import cn from 'classnames'
import { ColorTextProps, StyledColorText } from './text.styles'

export const RiColorText = ({
  color,
  component = 'span',
  className,
  ...rest
}: ColorTextProps) => (
  <StyledColorText
    {...rest}
    component={component}
    $color={color}
    className={cn(className, { [`color__${color}`]: !!color }, 'RI-color-text')}
  />
)
