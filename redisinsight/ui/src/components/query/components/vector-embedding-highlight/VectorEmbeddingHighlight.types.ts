import { RefObject } from 'react'

import { Nullable } from 'uiSrc/utils'
import { IEditorMount } from 'uiSrc/pages/workbench/interfaces'

export interface VectorEmbeddingHighlightProps {
  monacoObjects: RefObject<Nullable<IEditorMount>>
  query: string
}
