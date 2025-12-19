import { type ModifiedSentinelMaster } from 'uiSrc/slices/interfaces'

export interface SubmitButtonProps {
  selection: ModifiedSentinelMaster[]
  loading: boolean
  onClick: () => void
  isDisabled: boolean
}
