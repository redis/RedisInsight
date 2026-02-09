import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseQueryDecorationsProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  query: string
}
