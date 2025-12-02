import { RiTooltipProps } from 'uiSrc/components'

export interface CopyButtonProps {
  /** Text to copy to clipboard */
  copy?: string
  /** Optional callback called after copy action and state update */
  onCopy?: (...args: any[]) => void | Promise<void>
  /** Optional ID for the copy button */
  id?: string
  /** Label text for the success badge */
  successLabel?: string
  /** Duration of the fade-out animation in milliseconds */
  fadeOutDuration?: number
  /** Duration before resetting the copied state in milliseconds */
  resetDuration?: number
  /** Test ID for the component */
  'data-testid'?: string
  'aria-label'?: string
  /** Whether to show tooltip on hover (default: true) */
  withTooltip?: boolean
  /** Tooltip configuration options */
  tooltipConfig?: Omit<RiTooltipProps, 'children'>
}
