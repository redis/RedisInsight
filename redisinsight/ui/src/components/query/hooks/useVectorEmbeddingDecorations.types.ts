import { Nullable, VectorEmbeddingMark } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface UseVectorEmbeddingDecorationsProps {
  monacoObjects: React.RefObject<Nullable<IEditorMount>>
  /** Marks produced by {@link useVectorEmbeddingMarks}. */
  marks: VectorEmbeddingMark[]
}
