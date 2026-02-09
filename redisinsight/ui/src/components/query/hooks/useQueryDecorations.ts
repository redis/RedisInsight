import { useEffect, useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'
import { compact, first } from 'lodash'

import {
  decoration,
  isParamsLine,
  Nullable,
  toModelDeltaDecoration,
} from 'uiSrc/utils'

import { UseQueryDecorationsProps } from './useQueryDecorations.types'

/**
 * Manages multi-line command decorations and params line highlighting
 * in the Monaco editor.
 */
export const useQueryDecorations = ({
  monacoObjects,
  query,
}: UseQueryDecorationsProps) => {
  const decorationCollection = useRef<Nullable<monacoEditor.editor.IEditorDecorationsCollection>>(null)

  // Initialize decoration collection when editor becomes available
  useEffect(() => {
    if (!monacoObjects.current) return
    const { editor } = monacoObjects.current

    if (!decorationCollection.current) {
      decorationCollection.current = editor.createDecorationsCollection()
    }
  }, [monacoObjects.current])

  // Update decorations whenever query changes
  useEffect(() => {
    if (!monacoObjects.current || !decorationCollection.current) return

    const { monaco } = monacoObjects.current
    const lines = query.split('\n')
    const firstLine = first(lines) ?? ''
    const notCommandRegEx = /^[\s|//]/

    const newDecorations = compact(
      lines.map((line, index) => {
        if (
          !line ||
          notCommandRegEx.test(line) ||
          (index === 0 && isParamsLine(line))
        )
          return null
        const lineNumber = index + 1

        return toModelDeltaDecoration(
          decoration(
            monaco,
            `decoration_${lineNumber}`,
            lineNumber,
            1,
            lineNumber,
            1,
          ),
        )
      }),
    )

    // highlight the first line with params
    if (isParamsLine(firstLine)) {
      newDecorations.push({
        range: new monaco.Range(1, 1, 1, firstLine.indexOf(']') + 2),
        options: { inlineClassName: 'monaco-params-line' },
      })
    }

    decorationCollection.current.set(newDecorations)
  }, [query])

  return { decorationCollection }
}
