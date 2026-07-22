import { useEffect, useRef } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { useTranslation } from 'uiSrc/i18n'
import {
  collapseVectorEmbeddingValue,
  detectVectorEmbeddings,
  expandVectorEmbeddings,
  findVectorEmbeddingPlaceholders,
  getEmbeddingKey,
  getVectorEmbeddingValue,
  handleCopy,
  Nullable,
  VectorEmbeddingRange,
} from 'uiSrc/utils'

import { UseVectorEmbeddingCollapseProps } from './useVectorEmbeddingCollapse.types'

const EMBEDDING_HIDDEN_CLASS = 'monaco-vector-embedding-hidden'
const EMBEDDING_TOGGLE_CLASS = 'monaco-vector-embedding-toggle'
const EMBEDDING_EXPAND_CLASS = 'monaco-vector-embedding-expand'
const EMBEDDING_COPY_CLASS = 'monaco-vector-embedding-copy'
const ARROW_COLLAPSED = '▸'
const ARROW_EXPANDED = '▾'
const COPY_ICON = '⧉'
const EDIT_SOURCE = 'vector-embedding-collapse'

const toMonacoRange = (
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

/**
 * Collapses every detected embedding by replacing its text with a short
 * placeholder in the model and expands it back on click. The full value is
 * kept in the placeholder store and re-inserted at every exit path (expand,
 * copy, submit, save), so nothing is lost. Detection runs off the live model
 * text; embeddings start collapsed unless the user explicitly expanded them.
 */
export const useVectorEmbeddingCollapse = ({
  monacoObjects,
  query,
}: UseVectorEmbeddingCollapseProps) => {
  const { t } = useTranslation()
  const decorationCollection =
    useRef<Nullable<monacoEditor.editor.IEditorDecorationsCollection>>(null)
  const removeDomListeners = useRef<Nullable<() => void>>(null)
  const userExpandedKeys = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (!monacoObjects.current) return
    const { editor, monaco } = monacoObjects.current

    const model = editor.getModel()
    if (!model) return

    if (!decorationCollection.current) {
      decorationCollection.current = editor.createDecorationsCollection()
    }

    const text = model.getValue()
    const detected = detectVectorEmbeddings(text)

    // Collapse in one edit; it triggers a re-run that renders the chips.
    const marksToCollapse = detected.filter(
      (mark) => !userExpandedKeys.current.has(getEmbeddingKey(mark)),
    )
    if (marksToCollapse.length > 0) {
      editor.executeEdits(
        EDIT_SOURCE,
        marksToCollapse.map((mark) => ({
          range: toMonacoRange(monaco, model, mark.range),
          text: collapseVectorEmbeddingValue(
            text.slice(mark.range.start, mark.range.end),
            mark.dimensions,
            mark.byteSize,
          ),
        })),
      )
      // Pasting scrolls to the end of the blob; once collapsed, go back to top.
      const top = { lineNumber: 1, column: 1 }
      editor.setPosition(top)
      editor.revealPosition(top)
      return
    }

    const decorations: monacoEditor.editor.IModelDeltaDecoration[] = []

    findVectorEmbeddingPlaceholders(text).forEach((placeholder) => {
      const { start, end } = placeholder.range
      const metadataHover =
        placeholder.byteSize !== undefined
          ? {
              value: t('query.editor.vectorEmbedding.hover', {
                dimensions: placeholder.dimensions,
                byteSize: placeholder.byteSize,
              }),
            }
          : undefined

      decorations.push(
        // Hide the placeholder text (else the tokenizer colours it) and draw
        // the chip as injected spans. Label and copy button carry their own
        // hoverMessage so each hovers independently.
        {
          range: toMonacoRange(monaco, model, { start, end }),
          options: { inlineClassName: EMBEDDING_HIDDEN_CLASS },
        },
        {
          range: toMonacoRange(monaco, model, { start, end: start + 1 }),
          options: {
            hoverMessage: metadataHover,
            before: {
              content: `${ARROW_COLLAPSED} ${t(
                'query.editor.vectorEmbedding.label',
                { dimensions: placeholder.dimensions },
              )}`,
              inlineClassName: EMBEDDING_TOGGLE_CLASS,
            },
          },
        },
        {
          range: toMonacoRange(monaco, model, { start: end - 1, end }),
          options: {
            hoverMessage: { value: t('query.editor.vectorEmbedding.copy') },
            after: {
              content: COPY_ICON,
              inlineClassName: EMBEDDING_COPY_CLASS,
            },
          },
        },
      )
    })

    // A collapse arrow before every still-expanded blob.
    detected.forEach((mark) => {
      decorations.push({
        range: toMonacoRange(monaco, model, {
          start: mark.range.start,
          end: mark.range.start + 1,
        }),
        options: {
          before: {
            content: ARROW_EXPANDED,
            inlineClassName: EMBEDDING_EXPAND_CLASS,
          },
        },
      })
    })

    decorationCollection.current.set(decorations)

    if (removeDomListeners.current) return

    const domNode = editor.getContainerDomNode()

    const findPlaceholderAt = (modelText: string, offset: number | null) => {
      const placeholders = findVectorEmbeddingPlaceholders(modelText)
      if (offset !== null) {
        return placeholders.find(
          (p) => offset >= p.range.start && offset <= p.range.end,
        )
      }
      return placeholders.length === 1 ? placeholders[0] : undefined
    }

    const findMarkAt = (modelText: string, offset: number | null) => {
      const marks = detectVectorEmbeddings(modelText)
      if (offset !== null) {
        return marks.find(
          (m) => offset >= m.range.start && offset <= m.range.end,
        )
      }
      return marks.length === 1 ? marks[0] : undefined
    }

    // Handle chip clicks in the capture phase and stop the event before Monaco
    // sees it, so the caret never lands on the zero-width chip (even on hold).
    const handleChipMouseDown = (e: MouseEvent) => {
      const classList = (e.target as HTMLElement | null)?.classList
      const isCopy = classList?.contains(EMBEDDING_COPY_CLASS)
      const isCollapsedToggle = classList?.contains(EMBEDDING_TOGGLE_CLASS)
      const isExpandArrow = classList?.contains(EMBEDDING_EXPAND_CLASS)
      if (!isCopy && !isCollapsedToggle && !isExpandArrow) return

      e.preventDefault()
      e.stopPropagation()

      const currentModel = editor.getModel()
      if (!currentModel) return
      const text = currentModel.getValue()
      const mouseTarget = editor.getTargetAtClientPoint(e.clientX, e.clientY)
      const offset = mouseTarget?.position
        ? currentModel.getOffsetAt(mouseTarget.position)
        : null

      if (isExpandArrow) {
        const mark = findMarkAt(text, offset)
        if (!mark) return
        const selection = editor.getSelection()
        userExpandedKeys.current.delete(getEmbeddingKey(mark))
        editor.executeEdits(EDIT_SOURCE, [
          {
            range: toMonacoRange(monaco, currentModel, mark.range),
            text: collapseVectorEmbeddingValue(
              text.slice(mark.range.start, mark.range.end),
              mark.dimensions,
              mark.byteSize,
            ),
          },
        ])
        if (selection) editor.setSelection(selection)
        return
      }

      const placeholder = findPlaceholderAt(text, offset)
      if (!placeholder) return
      const value = getVectorEmbeddingValue(placeholder.id)
      if (value === undefined) return

      if (isCopy) {
        handleCopy(value)
        return
      }

      const selection = editor.getSelection()
      editor.executeEdits(EDIT_SOURCE, [
        {
          range: toMonacoRange(monaco, currentModel, placeholder.range),
          text: value,
        },
      ])
      // Keep it expanded across re-renders.
      const expandedMark = detectVectorEmbeddings(currentModel.getValue()).find(
        (m) => m.range.start === placeholder.range.start,
      )
      if (expandedMark) {
        userExpandedKeys.current.add(getEmbeddingKey(expandedMark))
      }
      if (selection) editor.setSelection(selection)
    }

    // Copy a selection with full values instead of the placeholders.
    const handleCopyEvent = (e: ClipboardEvent) => {
      const selection = editor.getSelection()
      const currentModel = editor.getModel()
      if (!selection || !currentModel || !e.clipboardData) return

      const selected = currentModel.getValueInRange(selection)
      const expanded = expandVectorEmbeddings(selected)
      if (expanded === selected) return

      e.preventDefault()
      e.stopPropagation()
      e.clipboardData.setData('text/plain', expanded)
    }

    domNode.addEventListener('mousedown', handleChipMouseDown, true)
    domNode.addEventListener('copy', handleCopyEvent, true)
    removeDomListeners.current = () => {
      domNode.removeEventListener('mousedown', handleChipMouseDown, true)
      domNode.removeEventListener('copy', handleCopyEvent, true)
    }
  }, [query, t, monacoObjects])

  useEffect(
    () => () => {
      removeDomListeners.current?.()
      removeDomListeners.current = null
    },
    [],
  )
}
