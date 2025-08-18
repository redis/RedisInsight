import React from 'react'
import cx from 'classnames'
import { PageClassNames, restrictWidthSize } from './page.styles'
import {
  ComponentTypes,
  PageBodyProps,
  StyledPageBody,
} from './page-body.styles'

export const RiPageBody = <T extends ComponentTypes = 'div'>({
  component = 'div' as T,
  className,
  restrictWidth,
  paddingSize,
  style,
  ...rest
}: PageBodyProps<T>) => (
  <StyledPageBody
    as={component}
    {...rest}
    $restrictWidth={restrictWidth}
    $paddingSize={paddingSize}
    style={restrictWidthSize(style, restrictWidth)}
    className={cx(PageClassNames.body, className)}
  />
)
