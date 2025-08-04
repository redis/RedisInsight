import React from 'react'
import cx from 'classnames'
import { useTheme } from '@redis-ui/styles'
import {
  SpacerProps,
  StyledSpacer,
} from 'uiSrc/components/base/layout/spacer/spacer.styles'

/**
 * A simple spacer component that can be used to add vertical spacing between
 * other components. The size of the spacer can be specified using the `size`
 * prop, which can be one of the following values:
 *   - Legacy sizes: 'xs' = 4px, 's' = 8px, 'm' = 12px, 'l' = 16px, 'xl' = 24px, 'xxl' = 32px
 *   - Theme spacing sizes: Any key from theme.semantic.core.space (e.g., 'space000', 'space010', 
 *     'space025', 'space050', 'space100', 'space150', 'space200', 'space250', 'space300', 
 *     'space400', 'space500', 'space550', 'space600', 'space800', etc.)
 *
 *   The theme spacing tokens are dynamically extracted from the theme, ensuring consistency
 *   and automatic updates when the theme changes.
 *
 *   The default value for `size` is 'l'.
 */
export const Spacer = ({ className, children, ...rest }: SpacerProps) => {
  const theme = useTheme()
  return (
    <StyledSpacer {...rest} className={cx('RI-spacer', className)} theme={theme}>
    {children}
  </StyledSpacer>
)
}