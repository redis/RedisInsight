import styled, { css } from 'styled-components'

import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { IconButtonProps } from 'uiSrc/components/base/forms/buttons/IconButton'

export const BulbWrapper = styled.div`
  position: relative;
`

export const BulbHighlighting = styled.span`
  // TODO: Using the background color from the previous value until there is an appropriate color
  // from the pallete to use for both light and dark themes.
  background-color: #ffaf2b;
  position: absolute;
  left: 5px;
  top: 5px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.color.gray100};
`

export const BulbIconButton = styled(IconButton)<
  { isOpen: boolean } & IconButtonProps
>`
  padding: ${({ theme }) => theme.core.space.space200};

  // TODO: Remove this once size property is enabled for IconButton
  svg {
    width: 21px;
    height: 21px;
  }

  ${({ isOpen }) =>
    isOpen &&
    css`
      background-color: ${({ theme }) =>
        theme.semantic.color.background.primary200} !important;
    `}
`
