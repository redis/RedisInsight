import styled from 'styled-components'
import { SecondaryButton } from 'uiSrc/components/base/forms/buttons'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const PopoverButton = styled(SecondaryButton).attrs({
  inverted: true,
  size: 's',
})`
  display: flex;
  align-items: center;
  border-radius: ${({ theme }: { theme: Theme }) => theme.core.space.space050};
`

/**
 * Popover panel width style - passed as maxWidth prop to RiPopover
 */
export const POPOVER_WIDTH = '299px'
