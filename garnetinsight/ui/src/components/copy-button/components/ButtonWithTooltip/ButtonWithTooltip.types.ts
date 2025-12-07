import { CopyButtonProps } from '../../CopyButton.types'

export interface ButtonWithTooltipProps {
  button: React.ReactNode
  withTooltip: boolean
  tooltipConfig: CopyButtonProps['tooltipConfig']
}
