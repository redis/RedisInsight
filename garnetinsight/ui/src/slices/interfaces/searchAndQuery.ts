import {
  CommandExecutionUI,
  RunQueryMode,
} from 'uiSrc/slices/interfaces/workbench'

export interface StateSearchAndQuery {
  isLoaded: boolean
  loading: boolean
  processing: boolean
  clearing: boolean
  error: string
  items: CommandExecutionUI[]
  activeRunQueryMode: RunQueryMode
}
