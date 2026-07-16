import { useEffect, useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { Nullable } from 'uiSrc/utils'

import { UseVectorEmbeddingDecorationsProps } from './useVectorEmbeddingDecorations.types'

const EMBEDDING_INLINE_CLASS = 'monaco-vector-embedding'

/** Human-readable summary shown on hover over a detected embedding. */
const hoverMessage = ({
  format,
  dimensions,
  byteSize,
}: {
  format: string
  dimensions: number
  byteSize: number
}) => ({
  value: `Vector embedding (${format}) — ${dimensions} dims, ${byteSize} bytes`,
})

/**
 * Renders a subtle inline highlight behind every detected vector embedding in
 * the editor. Mirrors {@link useQueryDecorations}: it lazily creates the
 * decoration collection after mount and recomputes whenever the marks change
 * (which happens on query change). Maps each mark's character range to a Monaco
 * range via the model, so it works across multi-line queries.
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
