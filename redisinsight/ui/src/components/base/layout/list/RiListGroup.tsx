import React from 'react'
import classNames from 'classnames'
import {
  ListClassNames,
  ListGroupProps,
  MAX_FORM_WIDTH,
  StyledGroup,
} from './list.styles'

export const RiListGroup = ({
  children,
  className,
  style,
  maxWidth = true,
  gap,
  flush,
  ...rest
}: ListGroupProps) => {
  let newStyle = style

  if (maxWidth) {
    newStyle = {
      ...newStyle,
      maxWidth: maxWidth === true ? MAX_FORM_WIDTH : maxWidth,
    }
  }
  const classes = classNames(ListClassNames.listGroup, className)
  return (
    <StyledGroup
      {...rest}
      className={classes}
      style={newStyle}
      $gap={gap}
      $flush={flush}
    >
      {children}
    </StyledGroup>
  )
}
