import React from 'react'
import cx from 'classnames'
import {
  PageClassNames,
  PageProps,
  restrictWidthSize,
  StyledPage,
} from './page.styles'

export const RiPage = ({
  className,
  restrictWidth = false,
  paddingSize = 'm',
  grow = true,
  direction = 'row',
  style,
  ...rest
}: PageProps) => (
  <StyledPage
    {...rest}
    className={cx(PageClassNames.page, className)}
    $grow={grow}
    $direction={direction}
    $restrictWidth={restrictWidth}
    $paddingSize={paddingSize}
    style={restrictWidthSize(style, restrictWidth)}
  />
)
