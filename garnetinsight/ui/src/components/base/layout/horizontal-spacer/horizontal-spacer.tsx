import React from 'react'
import cx from 'classnames'
import {
  HorizontalSpacerProps,
  StyledHorizontalSpacer,
} from './horizontal-spacer.styles'

export const HorizontalSpacer = ({ className, children, ...rest }: HorizontalSpacerProps) => (
  <StyledHorizontalSpacer {...rest} className={cx('RI-horizontal-spacer', className)}>
    {children}
  </StyledHorizontalSpacer>
) 