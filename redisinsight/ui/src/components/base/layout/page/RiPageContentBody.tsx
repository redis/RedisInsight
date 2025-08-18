import cx from 'classnames'
import React from 'react'
import {
  PageClassNames,
  PageContentBodyProps,
  restrictWidthSize,
  StyledPageContentBody,
} from './page.styles'

export const RiPageContentBody = ({
  restrictWidth = false,
  paddingSize = 'none',
  style,
  className,
  ...rest
}: PageContentBodyProps) => {
  const classes = cx(PageClassNames.contentBody, className)

  return (
    <StyledPageContentBody
      className={classes}
      $paddingSize={paddingSize}
      $restrictWidth={restrictWidth}
      style={restrictWidthSize(style, restrictWidth)}
      {...rest}
    />
  )
}
