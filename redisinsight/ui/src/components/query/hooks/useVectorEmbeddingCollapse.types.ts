import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseVectorEmbeddingCollapseProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  /** Editor content; only a change trigger — detection runs off the model. */
  query: string
}
