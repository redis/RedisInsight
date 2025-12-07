import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'
import { PaddingSize } from 'uiSrc/components/base/layout/page/page.styles'

export const PageHeaderClassName = 'RI-page-header'
export const ALIGN_ITEMS = ['top', 'bottom', 'center', 'stretch'] as const
export type PageHeaderProps = HTMLAttributes<HTMLHeadingElement> & {
  className?: string
  /**
   * Sets the max-width of the page,
   * set to `true` to use the default size of `1200px`,
   * set to `false` to not restrict the width,
   * set to a number for a custom width in px,
   * set to a string for a custom width in custom measurement.
   */
  restrictWidth?: boolean | number | string
  /**
   * Adjust the padding.
   * When using this setting it's best to be consistent throughout all similar usages
   */
  paddingSize?: PaddingSize
  /**
   * Changes the `flex-direction` property.
   * Flip to `column` when not including a sidebar.
   */
  direction?: 'row' | 'column'
  /**
   * Set to false if you don't want the children to stack at small screen sizes.
   * Set to `reverse` to display the right side content first for the sack of hierarchy (like global time)
   */
  responsive?: boolean | 'reverse'
  /**
   * Vertical alignment of the left and right side content;
   * Default is `middle` for custom content, but `top` for when `pageTitle` or `tabs` are included
   */
  alignItems?: (typeof ALIGN_ITEMS)[number]
  /**
   * defaults to false.
   */
  bottomBorder?: boolean
}

const pageHeaderStyles = {
  align: {
    top: css`
      align-items: flex-start;
    `,
    bottom: css`
      align-items: flex-end;
    `,
    center: css`
      align-items: center;
    `,
    stretch: css`
      align-items: stretch;
    `,
  },
  direction: {
    row: css`
      flex-direction: row;
    `,
    column: css`
      flex-direction: column;
    `,
  },
  border: css`
    padding-bottom: 24px;
    border-bottom: 1px solid #d3dae6;
  `,
  // Padding
  padding: {
    none: css`
      padding: 0;
    `,
    // todo: use theme
    s: css`
      padding: 8px;
    `,
    m: css`
      padding: 16px;
    `,
    l: css`
      padding: 24px;
    `,
  },
  responsive: css`
    @media only screen and (min-width: 575px) and (max-width: 768px) {
      flex-direction: column;
    }
  `,
  responsiveReverse: css`
    @media only screen and (min-width: 575px) and (max-width: 768px) {
      flex-direction: column-reverse;
    }
  `,
  restrictWidth: css`
    margin-inline: auto;
  `,
}
type StyledPageHeaderProps = Omit<
  PageHeaderProps,
  | 'direction'
  | 'responsive'
  | 'alignItems'
  | 'bottomBorder'
  | 'paddingSize'
  | 'restrictWidth'
> & {
  $restrictWidth?: boolean | number | string
  $paddingSize?: PaddingSize
  $direction?: 'row' | 'column'
  $responsive?: boolean | 'reverse'
  $alignItems?: (typeof ALIGN_ITEMS)[number]
  $bottomBorder?: boolean
}
export const StyledPageHeader = styled.header<StyledPageHeaderProps>`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-shrink: 0;
  justify-content: space-between;
  ${({ $responsive = true }) => {
    if (!$responsive) return ''
    return $responsive === 'reverse'
      ? pageHeaderStyles.responsiveReverse
      : pageHeaderStyles.responsive
  }}
  ${({ $direction = 'row' }) => pageHeaderStyles.direction[$direction]}
  ${({ $paddingSize = 'none' }) =>
    $paddingSize && pageHeaderStyles.padding[$paddingSize]}
  ${({ $alignItems = 'center' }) =>
    $alignItems && pageHeaderStyles.align[$alignItems]}
  ${({ $bottomBorder = false }) => $bottomBorder && pageHeaderStyles.border}
`
