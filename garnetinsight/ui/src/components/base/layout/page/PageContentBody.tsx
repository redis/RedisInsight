import cx from 'classnames'
import React from 'react'
import {
  PageClassNames,
  PageContentBodyProps,
  restrictWidthSize,
  StyledPageContentBody,
} from 'uiSrc/components/base/layout/page/page.styles'

const PageContentBody = ({
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

export default PageContentBody
