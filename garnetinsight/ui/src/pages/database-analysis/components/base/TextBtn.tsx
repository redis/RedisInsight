import styled from 'styled-components'
import React from 'react'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
/**
 * Text button component
 *
 * This is how we can implement custom styles
 */
export const TextBtn = styled(EmptyButton)<
  React.ComponentProps<typeof EmptyButton> & {
    $active?: boolean
  }
>`
  border: none;
  min-width: auto;
  min-height: auto;
  border-radius: 4px;
  opacity: ${({ $active }) => ($active ? '1' : '')};
  background: ${({ $active }) =>
    $active ? 'var(--browserComponentActive)' : 'transparent'};
  color: ${({ $active }) =>
    $active ? 'var(--wbActiveIconColor)' : 'var(--wbHoverIconColor)'};
  margin-left: 18px;
  box-shadow: none;
  font:
    normal normal normal 13px/17px Graphik,
    sans-serif;

  &:hover {
    color: var(--wbHoverIconColor);
  }
`
