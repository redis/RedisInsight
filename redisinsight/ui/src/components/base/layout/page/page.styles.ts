import styled, { css } from 'styled-components'
import { CSSProperties, HTMLAttributes } from 'react'
import { StyledPageHeader } from 'uiSrc/components/base/layout/page/page-heading.styles'
import { StyledPageBody } from 'uiSrc/components/base/layout/page/page-body.styles'
import { Theme } from 'uiSrc/components/base/theme/types'

export const PageClassNames = {
  page: 'RI-page',
  body: 'RI-page-body',
  contentBody: 'RI-page-content-body',
}
export const PADDING_SIZES = ['none', 's', 'm', 'l'] as const
export type PaddingSize = (typeof PADDING_SIZES)[number]
export const PAGE_MAX_WIDTH: CSSProperties['maxWidth'] = '1200px'

export type PageProps = HTMLAttributes<HTMLDivElement> & {
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
   * Adds `flex-grow: 1` to the whole page for stretching to fit vertically.
   * Must be wrapped inside a flexbox, preferably with `min-height: 100vh`
   */
  grow?: boolean
  /**
   * Changes the `flex-direction` property.
   * Flip to `column` when not including a sidebar.
   */
  direction?: 'row' | 'column'
}

// Define the type for the padding object
type PaddingStyles = {
  none: ReturnType<typeof css>
  s: ReturnType<typeof css>
  m: ReturnType<typeof css>
  l: ReturnType<typeof css>
}

// Define the type for the pageStyles object
type PageStyles = {
  grow: ReturnType<typeof css>
  column: ReturnType<typeof css>
  row: ReturnType<typeof css>
  restrictWidth: ReturnType<typeof css>
  padding: PaddingStyles
}

export const pageStyles: PageStyles = {
  // Grow
  grow: css`
    flex-grow: 1;
  `,

  // Direction
  column: css`
    flex-direction: column;
  `,

  row: css`
    flex-direction: row;
  `,

  // Max widths
  restrictWidth: css`
    margin-inline: auto;
  `,

  // Padding
  padding: {
    none: css`
      padding: 0;
    `,
    // todo: use theme
    s: css`
      padding: 8px;

      ${StyledPageBody} {
        & > ${StyledPageHeader} {
          margin-bottom: 8px;
        }
      }
    `,
    m: css`
      padding: 16px;
      ${StyledPageBody} {
        & > ${StyledPageHeader} {
          margin-bottom: 16px;
        }
      }
    `,
    l: css`
      padding: 24px;

      ${StyledPageBody} {
        & > ${StyledPageHeader} {
          margin-bottom: 24px;
        }
      }
    `,
  },
}

export const StyledPage = styled.div<
  Omit<PageProps, 'grow' | 'direction' | 'restrictWidth' | 'paddingSize'> & {
    $grow?: boolean
    $direction?: 'row' | 'column'
    $restrictWidth?: boolean | number | string
    $paddingSize?: PaddingSize
  }
>`
  display: flex;
  background-color: ${({ theme }: { theme: Theme }) =>
    theme.semantic.color.background.neutral100};
  /* Ensure Safari doesn't shrink height beyond contents */
  flex-shrink: 0;
  /* Ensure Firefox doesn't expand width beyond bounds */
  max-width: 100%;
  ${({ $grow = true }) => $grow && pageStyles.grow}
  ${({ $restrictWidth = false }) => $restrictWidth && pageStyles.restrictWidth}
  ${({ $direction = 'row' }) =>
    $direction === 'column' ? pageStyles.column : pageStyles.row}
  ${({ $paddingSize = 'none' }) =>
    $paddingSize && pageStyles.padding[$paddingSize]}
`

/**
 * Returns a new style object with a maxWidth property set according to the
 * given `restrictWidth` argument.
 *
 * If `restrictWidth` is:
 * - `true`, sets `maxWidth` to `PAGE_MAX_WIDTH` (1200px).
 * - A string, sets `maxWidth` to that string.
 * - A number, sets `maxWidth` to that number followed by the string `'px'`.
 * - `false`, does nothing.
 *
 * If `style` is given, the new style object will have all of its properties,
 * and then the `maxWidth` property will be set according to the above rules.
 *
 * @param {React.CSSProperties} [style] The style object to modify.
 * @param {boolean | number | string} [restrictWidth] The value to set
 *   `maxWidth` to.
 * @return {React.CSSProperties} A new style object with the `maxWidth` property
 *   set according to the given `restrictWidth` argument.
 */
export function restrictWidthSize(
  style: React.CSSProperties = {},
  restrictWidth?: boolean | number | string,
) {
  const newStyle = { ...style }

  if (restrictWidth === true) {
    newStyle.maxWidth = PAGE_MAX_WIDTH
  } else if (restrictWidth !== false) {
    if (typeof restrictWidth === 'string') {
      newStyle.maxWidth = restrictWidth
    } else if (typeof restrictWidth === 'number') {
      newStyle.maxWidth = `${restrictWidth}px`
    }
  }
  return newStyle
}

export type PageContentBodyProps = HTMLAttributes<HTMLDivElement> & {
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
}
type StyledPageContentBodyProps = Omit<
  PageContentBodyProps,
  'restrictWidth' | 'paddingSize'
> & {
  $restrictWidth?: boolean | number | string
  $paddingSize?: PaddingSize
}
const pageContentBodyStyles = {
  restrictWidth: css`
    margin-left: auto;
    margin-right: auto;
    width: 100%;
  `,
}
export const StyledPageContentBody = styled.div<StyledPageContentBodyProps>`
  ${({ $restrictWidth = false }) =>
    $restrictWidth && pageContentBodyStyles.restrictWidth}
  ${({ $paddingSize = 'none' }) =>
    $paddingSize && pageStyles.padding[$paddingSize]}
`
