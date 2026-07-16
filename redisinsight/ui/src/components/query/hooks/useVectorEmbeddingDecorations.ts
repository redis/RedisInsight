import { useEffect, useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { Nullable, VectorEmbeddingMark } from 'uiSrc/utils'

import { UseVectorEmbeddingDecorationsProps } from './useVectorEmbeddingDecorations.types'

const EMBEDDING_INLINE_CLASS = 'monaco-vector-embedding'

const hoverMessage = ({
  format,
  dimensions,
  byteSize,
}: VectorEmbeddingMark) => ({
  value: `Vector embedding (${format}) — ${dimensions} dims, ${byteSize} bytes`,
})

/**
 * Applies an inline highlight behind every detected embedding. Lazily creates
 * the decoration collection after mount and recomputes when the marks change.
 */
export const useVectorEmbeddingDecorations = ({
  monacoObjects,
  marks,
}: UseVectorEmbeddingDecorationsProps) => {
  const decorationCollection =
    useRef<Nullable<monacoEditor.editor.IEditorDecorationsCollection>>(null)

  useEffect(() => {
    if (!monacoObjects.current) return
    const { editor, monaco } = monacoObjects.current

    if (!decorationCollection.current) {
      decorationCollection.current = editor.createDecorationsCollection()
    }

    const model = editor.getModel()
    if (!model) return

    const newDecorations = marks.map((mark) => {
      const start = model.getPositionAt(mark.range.start)
      const end = model.getPositionAt(mark.range.end)

      return {
        range: new monaco.Range(
          start.lineNumber,
          start.column,
          end.lineNumber,
          end.column,
        ),
        options: {
          inlineClassName: EMBEDDING_INLINE_CLASS,
          hoverMessage: hoverMessage(mark),
        },
      }
    })

    decorationCollection.current.set(newDecorations)
  }, [marks])

  return { decorationCollection }
}
