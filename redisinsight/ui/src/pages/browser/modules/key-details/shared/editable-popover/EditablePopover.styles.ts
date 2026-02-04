import styled, { css } from 'styled-components'
import { Loader } from 'uiSrc/components/base/display'

interface PopoverWrapperProps {
  $isDelayed?: boolean
}

// Styles injected via wrapper for panelClassName
export const popoverWrapperClassName = 'editable-popover-panel'

export const PopoverStyles = styled.div<PopoverWrapperProps>`
  .${popoverWrapperClassName} {
    ${({ $isDelayed }) =>
      $isDelayed &&
      css`
        opacity: 0;
      `}
  }
`

export const Spinner = styled(Loader)`
  margin: ${({ theme }) =>
    `${theme.core.space.space25} ${theme.core.space.space50}`};
  border-top-color: ${({ theme }) => theme.semantic.color.border.primary500};
`
