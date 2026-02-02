import styled from 'styled-components'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { type Theme } from 'uiSrc/components/base/theme/types'

export const AlertIcon = styled(RiIcon).attrs({
  type: 'ToastDangerIcon',
})`
  margin-right: ${({ theme }: { theme: Theme }) => theme.core.space.space100};
`

/**
 * Popover panel width style - passed as maxWidth prop to RiPopover
 */
export const POPOVER_WIDTH = '493px'
