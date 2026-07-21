import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseVectorEmbeddingCollapseProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  /** Editor content; only a change trigger — detection runs off the model. */
  query: string
}

export interface UseVectorEmbeddingCollapseReturn {
  /** Content-widget node to portal the copy button into (null before mount). */
  copyWidgetNode: Nullable<HTMLDivElement>
  /** Value the hovered chip's copy button copies; null while hidden. */
  copyValue: Nullable<string>
}
