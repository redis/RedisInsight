import { monaco as monacoEditor } from 'react-monaco-editor'

import { VectorEmbeddingRange } from 'uiSrc/utils'

export const toMonacoRange = (
  monaco: typeof monacoEditor,
  model: monacoEditor.editor.ITextModel,
  range: VectorEmbeddingRange,
): monacoEditor.Range => {
  const start = model.getPositionAt(range.start)
  const end = model.getPositionAt(range.end)
  return new monaco.Range(
    start.lineNumber,
    start.column,
    end.lineNumber,
    end.column,
  )
}

export const findAtOffset = <T extends { range: VectorEmbeddingRange }>(
  items: T[],
  offset: number | null,
): T | undefined => {
  if (offset !== null) {
    return items.find(
      (item) => offset >= item.range.start && offset <= item.range.end,
    )
  }
  return items.length === 1 ? items[0] : undefined
}
