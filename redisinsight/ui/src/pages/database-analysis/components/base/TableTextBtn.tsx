import styled, { css } from 'styled-components'
import React from 'react'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Theme } from 'uiSrc/components/base/theme/types'

const expandedStyle = css<{ theme: Theme }>`
  padding: 0 20px 0 12px;
`
/**
 * Text button component in top namespaces table
 *
 * This is how we can implement custom styles
 */
export const TableTextBtn = styled(EmptyButton).attrs({
  variant: 'primary-inline',
})<
  React.ComponentProps<typeof EmptyButton> & {
    $expanded?: boolean
    theme: Theme
  }
>`
  max-width: calc(100% - 20px);
  width: auto;
  ${({ $expanded }) => $expanded && expandedStyle}
`
