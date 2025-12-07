import React from 'react'
import cx from 'classnames'
import {
  PageClassNames,
  restrictWidthSize,
} from 'uiSrc/components/base/layout/page/page.styles'
import {
  ComponentTypes,
  PageBodyProps,
  StyledPageBody,
} from 'uiSrc/components/base/layout/page/page-body.styles'

const PageBody = <T extends ComponentTypes = 'div'>({
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

export default PageBody
