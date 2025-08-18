import React from 'react'
import classNames from 'classnames'

import {
  HorizontalRuleProps,
  StyledHorizontalRule,
} from './horizontal-rule.styles'

export const RiHorizontalRule = ({
  className,
  size = 'full',
  margin = 'l',
  ...rest
}: HorizontalRuleProps) => {
  const classes = classNames('RI-horizontal-rule', className)

  return (
    <StyledHorizontalRule
      size={size}
      margin={margin}
      className={classes}
      {...rest}
    />
  )
}
