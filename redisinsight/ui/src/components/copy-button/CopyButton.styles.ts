import styled, { keyframes } from 'styled-components'
import { RiBadge } from 'uiSrc/components/base/display/badge/RiBadge'
import { Row } from 'uiSrc/components/base/layout/flex'

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`

/**
 * Props for StyledCopiedBadge component
 * @member $fadeOutDuration - Duration of the fade-out animation in milliseconds
 */
interface StyledCopiedBadgeProps {
  /** Duration of the fade-out animation in milliseconds */
  $fadeOutDuration: number
  /** Whether the badge is empty */
  $isEmpty: boolean
}

const isEmptyStyles = `
  padding: 0;
  gap: 0;
`

export const StyledCopiedBadge = styled(RiBadge)<StyledCopiedBadgeProps>`
  border-color: transparent;
  background-color: transparent;
  animation: ${fadeOut} ${({ $fadeOutDuration }) => $fadeOutDuration}ms
    ease-in-out forwards;
  ${({ $isEmpty }) => $isEmpty && isEmptyStyles}
`

export const StyledTooltipContainer = styled(Row)`
  // aiming at the tooltip trigger container, try to make its layout more consistent with the button
  & > span[data-state] {
    display: flex;
    justify-content: center;
    align-items: center;
  }
`
