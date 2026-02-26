import { Nullable } from 'uiSrc/utils'
import { CommandExecutionUI } from 'uiSrc/slices/interfaces'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseCommandHistoryProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  historyItems: CommandExecutionUI[]
}
