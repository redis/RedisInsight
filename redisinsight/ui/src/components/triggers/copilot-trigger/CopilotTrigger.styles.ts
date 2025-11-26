import styled, { css } from 'styled-components'

import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import { IconButtonProps } from 'uiSrc/components/base/forms/buttons/IconButton'

export const CopilotWrapper = styled(FlexGroup)`
  user-select: none;
`

export const CopilotIconButton = styled(IconButton)<
  { isOpen: boolean } & IconButtonProps
>`
  padding: ${({ theme }) => theme.core.space.space200};

  // TODO: Remove this once size property is enabled for IconButton
  svg {
    width: 21px;
    height: 21px;
    color: ${({ theme }) => theme.semantic.color.text.attention600};
  }

  ${({ isOpen }) =>
    isOpen &&
    css`
      background-color: ${({ theme }) =>
        theme.semantic.color.background.primary200};
    `}
`
