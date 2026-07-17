import { HTMLAttributes } from 'react'
import styled, { css } from 'styled-components'

/**
 * Standard screen-reader-only ruleset: the element stays in the
 * accessibility tree but is removed from the visual layout.
 * Apply to any styled component via `${visuallyHiddenCss}` or render
 * the ready-made <VisuallyHidden> span.
 */
export const visuallyHiddenCss = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
`

export const VisuallyHidden = styled.span<HTMLAttributes<HTMLSpanElement>>`
  ${visuallyHiddenCss}
`
