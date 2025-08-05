import React from 'react'
import cx from 'classnames'
import { restrictWidthSize } from './page.styles'
import {
  PageHeaderClassName,
  PageHeaderProps,
  StyledPageHeader,
} from './page-heading.styles'

export const RiPageHeader = ({
  className,
  style,
  restrictWidth,
  alignItems,
  responsive = true,
  bottomBorder,
  paddingSize,
  direction,
  ...rest
}: PageHeaderProps) => (
  <StyledPageHeader
    {...rest}
    style={restrictWidthSize(style, restrictWidth)}
    className={cx(className, PageHeaderClassName)}
    $restrictWidth={restrictWidth}
    $paddingSize={paddingSize}
    $direction={direction}
    $responsive={responsive}
    $alignItems={alignItems}
    $bottomBorder={bottomBorder}
  />
)
