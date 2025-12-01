import styled, { css } from 'styled-components'
import React from 'react'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { Theme } from 'uiSrc/components/base/theme/types'

const expandedStyle = css<{ theme: Theme }>`
  padding: 0 20px 0 12px;
`

export const TableTextBtn = styled(EmptyButton).attrs({
  variant: 'primary-inline',
}) <
  React.ComponentProps<typeof EmptyButton> & {
    $expanded?: boolean
    theme: Theme
  }
>`
  max-width: calc(100% - 20px);
  width: auto;
  color: ${({ theme }) => theme.semantic.color.text.primary600};
  text-decoration: underline;

  &:hover,
  &:focus {
    text-decoration: none;
  }

  ${({ $expanded }) => $expanded && expandedStyle}
`
