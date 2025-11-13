import { css, CSSObject, FlattenSimpleInterpolation } from 'styled-components'

/**
 * Breakpoint values matching EUI breakpoints
 * Equivalent to $euiBreakpoints in SCSS
 */
export const euiBreakpoints = {
  xs: 0,
  s: 575,
  m: 768,
  l: 992,
  xl: 1200,
} as const

export type BreakpointKey = keyof typeof euiBreakpoints

/**
 * Media query helper for breakpoints
 * Equivalent to @include eui.euiBreakpoint() in SCSS
 *
 * @param sizes - One or more breakpoint keys
 * @returns A function that takes template literals and returns styled-components CSS
 *
 * @example
 * ```typescript
 * const Container = styled.div`
 *   padding: 10px;
 *
 *   // For xs and s screens only
 *   ${euiBreakpoint('xs', 's')`
 *     padding: 5px;
 *   `}
 *
 *   // For m, l, and xl screens
 *   ${euiBreakpoint('m', 'l', 'xl')`
 *     padding: 20px;
 *   `}
 * `
 * ```
 */
export const euiBreakpoint = (...sizes: BreakpointKey[]) => {
  return (
    strings: TemplateStringsArray,
    ...interpolations: Array<string | number | FlattenSimpleInterpolation | CSSObject>
  ) => {
    const content = css(strings, ...interpolations)
    const breakpointKeys = Object.keys(euiBreakpoints) as BreakpointKey[]

    return sizes.map((size) => {
      const index = breakpointKeys.indexOf(size)

      if (index === -1) {
        console.warn(
          `euiBreakpoint(): '${size}' is not a valid breakpoint. Valid breakpoints are: ${breakpointKeys.join(', ')}`
        )
        return ''
      }

      const minSize = euiBreakpoints[size]

      // If it's the last breakpoint, don't set max-width
      if (index === breakpointKeys.length - 1) {
        return css`
          @media only screen and (min-width: ${minSize}px) {
            ${content}
          }
        `
      }

      // If it's the first breakpoint (xs), only set max-width
      if (index === 0) {
        const nextKey = breakpointKeys[index + 1]
        const maxSize = euiBreakpoints[nextKey] - 1
        return css`
          @media only screen and (max-width: ${maxSize}px) {
            ${content}
          }
        `
      }

      // Otherwise, set both min and max width
      const nextKey = breakpointKeys[index + 1]
      const maxSize = euiBreakpoints[nextKey] - 1
      return css`
        @media only screen and (min-width: ${minSize}px) and (max-width: ${maxSize}px) {
          ${content}
        }
      `
    })
  }
}

/**
 * Insights panel open state responsive mixin
 * Equivalent to @include global.insights-open() in SCSS
 *
 * @param maxWidth - Maximum width for the media query (default: 1440px)
 * @returns A function that takes template literals and returns styled-components CSS
 *
 * @example
 * ```typescript
 * const ControlsIcon = styled(RiIcon)`
 *   margin-left: 3px;
 *
 *   ${insightsOpen(1440)`
 *     width: 18px !important;
 *     height: 18px !important;
 *   `}
 * `
 *
 * // With custom max-width
 * const Promo = styled.div`
 *   display: flex;
 *
 *   ${insightsOpen(1350)`
 *     display: none;
 *   `}
 * `
 * ```
 */
export const insightsOpen = (maxWidth: number = 1440) => {
  return (
    strings: TemplateStringsArray,
    ...interpolations: Array<string | number | FlattenSimpleInterpolation | CSSObject>
  ) => {
    const content = css(strings, ...interpolations)
    return css`
      :global(.insightsOpen) {
        @media only screen and (max-width: ${maxWidth}px) {
          ${content}
        }
      }
    `
  }
}

/**
 * Scrollbar styling mixin for styled-components
 * Equivalent to @include eui.scrollBar() in SCSS
 *
 * @param width - The width of the scrollbar (default: 16px)
 * @returns CSS template with scrollbar styling
 *
 * @example
 * ```typescript
 * const Container = styled.div`
 *   ${scrollbarStyles()}
 *   height: 100%;
 * `
 *
 * // With custom width
 * const ThinContainer = styled.div`
 *   ${scrollbarStyles(12)}
 *   height: 100%;
 * `
 * ```
 */
export const scrollbarStyles = (width: number = 16) => css`
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    width: ${width}px;
    height: ${width}px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(105, 112, 125, 0.5);
    border: 6px solid rgba(0, 0, 0, 0);
    background-clip: content-box;
  }

  &::-webkit-scrollbar-corner,
  &::-webkit-scrollbar-track {
    background-color: rgba(0, 0, 0, 0);
  }
`

