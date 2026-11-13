import styled, { css } from 'styled-components'

import { FlexGroup } from 'uiSrc/components/base/layout/flex'
import { EmptyButton } from 'uiSrc/components/base/forms/buttons'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'

export const DevToolsWrapper = styled(FlexGroup)`
  user-select: none;
`

export const TriggerButton = styled(EmptyButton)<{ $isOpen: boolean }>`
  ${({ $isOpen, theme }) =>
    $isOpen &&
    css`
      background-color: ${theme.semantic.color.background.primary200};
    `}
`

export const NewBadge = styled(RiBadge)`
  && {
    height: ${({ theme }) => theme.core.space.space150};
    padding: 0 ${({ theme }) => theme.core.space.space050};
    margin-left: ${({ theme }) => theme.core.space.space100};
  }

  & > p {
    font-size: ${({ theme }) => theme.core.font.fontSize.s10};
    line-height: 1;
  }
`
