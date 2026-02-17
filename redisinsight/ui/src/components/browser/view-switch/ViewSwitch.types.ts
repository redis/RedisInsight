import { IconType } from 'uiSrc/components/base/icons'
import { KeyViewType } from 'uiSrc/slices/interfaces/keys'

export interface ISwitchType {
  tooltipText: string
  type: KeyViewType
  disabled?: boolean
  ariaLabel: string
  dataTestId: string
  getIconType: () => IconType
}

export interface ViewSwitchProps {
  viewType: KeyViewType
  isTreeViewDisabled?: boolean
  onChange: (type: KeyViewType) => void
}
