import { useEffect, useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { useTranslation } from 'uiSrc/i18n'
import { Nullable } from 'uiSrc/utils'

import { UseVectorEmbeddingDecorationsProps } from './useVectorEmbeddingDecorations.types'

const EMBEDDING_INLINE_CLASS = 'monaco-vector-embedding'

/**
 * Applies an inline highlight behind every detected embedding. Lazily creates
 * the decoration collection after mount and recomputes when the marks change.
 */
export const useVectorEmbeddingDecorations = ({
  monacoObjects,
  marks,
}: UseVectorEmbeddingDecorationsProps) => {
  const { t } = useTranslation()
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
          hoverMessage: {
            value: t('query.editor.vectorEmbedding.hover', {
              dimensions: mark.dimensions,
              byteSize: mark.byteSize,
            }),
          },
        },
      }
    })

    decorationCollection.current.set(newDecorations)
  }, [marks, t])

  return { decorationCollection }
}
