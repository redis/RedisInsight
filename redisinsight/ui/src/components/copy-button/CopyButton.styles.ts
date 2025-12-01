import styled, { keyframes } from 'styled-components'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

/** Props for StyledCopiedBadge component
 * @member $fadeOutDuration - Duration of the fade-out animation in milliseconds
 */
interface StyledCopiedBadgeProps {
  /** Duration of the fade-out animation in milliseconds */
  $fadeOutDuration: number
}

export const StyledCopiedBadge = styled(RiBadge)<StyledCopiedBadgeProps>`
  border-color: transparent;
  background-color: transparent;
  animation: ${fadeOut} ${({ $fadeOutDuration }) => $fadeOutDuration}ms ease-out
    forwards;
`
