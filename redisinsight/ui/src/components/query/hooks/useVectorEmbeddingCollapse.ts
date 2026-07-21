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
// Collapsed label (left half of the chip) and standalone expanded arrow.
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
 * Collapses every detected embedding by replacing its text in the editor with
 * a short placeholder and expands it back on click. The model really contains
 * the placeholder — so the cursor, wrapping and navigation behave as if the
 * blob were gone — while the full value is kept in the placeholder store and
 * re-inserted at every exit path: expanding, copying (handled here) and
 * submitting/saving (handled by the query editor context/wrappers via
 * expandVectorEmbeddings).
 *
 * All detection and slicing works off the live model text (not the React
 * `query` state, which lags the model by a render) so an in-flight collapse or
 * expand never bails on stale offsets; `query` is only a change trigger. Every
 * detected embedding is collapsed unless the user explicitly expanded it, so a
 * freshly pasted embedding always starts collapsed while an expanded one is
 * left alone until re-collapsed.
 */
export const useVectorEmbeddingCollapse = ({
  monacoObjects,
  query,
}: UseVectorEmbeddingCollapseProps) => {
  const { t } = useTranslation()
  const decorationCollection =
    useRef<Nullable<monacoEditor.editor.IEditorDecorationsCollection>>(null)
  const mouseListener = useRef<Nullable<monacoEditor.IDisposable>>(null)
  const removeCopyListener = useRef<Nullable<() => void>>(null)
  // Content keys the user explicitly expanded; everything else auto-collapses.
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

    // Collapse every detected embedding except the ones the user expanded, in
    // one atomic edit. The edit updates the model (and, via onChange, `query`),
    // so the effect re-runs and renders the chips on the placeholders it wrote.
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
          ),
        })),
      )
      // Pasting a query scrolls the editor to the end of the blob; once it is
      // collapsed there is nothing to scroll to, so return to the top.
      const top = { lineNumber: 1, column: 1 }
      editor.setPosition(top)
      editor.revealPosition(top)
      return
    }

    const decorations: monacoEditor.editor.IModelDeltaDecoration[] = []

    // Collapsed embeddings: hide the whole placeholder text (otherwise the
    // Redis tokenizer would syntax-colour it and split the chip background per
    // token) and render the chip as a single injected span, which is not
    // tokenised so it stays one clean pill.
    findVectorEmbeddingPlaceholders(text).forEach((placeholder) => {
      decorations.push({
        range: toMonacoRange(monaco, model, placeholder.range),
        options: {
          inlineClassName: EMBEDDING_HIDDEN_CLASS,
          before: {
            content: `${ARROW_COLLAPSED} ${t(
              'query.editor.vectorEmbedding.label',
              { dimensions: placeholder.dimensions },
            )}`,
            inlineClassName: EMBEDDING_TOGGLE_CLASS,
          },
          // Copy button to the right of the chip: copies the full embedding.
          after: {
            content: COPY_ICON,
            inlineClassName: EMBEDDING_COPY_CLASS,
          },
        },
      })
    })

    // Expanded embeddings (a raw blob the user chose to show): a collapse
    // arrow chip before the full value. The decoration must span the first
    // character (not a zero-width range) or Monaco won't render the injected
    // arrow; the character itself is left unstyled.
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

    if (!mouseListener.current) {
      mouseListener.current = editor.onMouseDown((e) => {
        const element = e.target.element as HTMLElement | null
        const classList = element?.classList
        const isCopy = classList?.contains(EMBEDDING_COPY_CLASS)
        const isToggle =
          classList?.contains(EMBEDDING_TOGGLE_CLASS) ||
          classList?.contains(EMBEDDING_EXPAND_CLASS)
        if (!isCopy && !isToggle) return

        const { position } = e.target
        const currentModel = editor.getModel()
        if (!position || !currentModel) return

        const currentText = currentModel.getValue()
        const offset = currentModel.getOffsetAt(position)

        // A click on the copy button copies the full embedding value.
        if (isCopy) {
          const target = findVectorEmbeddingPlaceholders(currentText).find(
            (p) => offset >= p.range.start && offset <= p.range.end,
          )
          const value = target ? getVectorEmbeddingValue(target.id) : undefined
          if (value === undefined) return
          e.event.preventDefault()
          handleCopy(value)
          return
        }

        // A click on a collapsed chip expands it back to the stored value.
        const placeholder = findVectorEmbeddingPlaceholders(currentText).find(
          (p) => offset >= p.range.start && offset <= p.range.end,
        )
        if (placeholder) {
          const value = getVectorEmbeddingValue(placeholder.id)
          if (value === undefined) return
          e.event.preventDefault()
          editor.executeEdits(EDIT_SOURCE, [
            {
              range: toMonacoRange(monaco, currentModel, placeholder.range),
              text: value,
            },
          ])
          // Remember this embedding as user-expanded so it is not
          // auto-collapsed again on the next render.
          const expandedMark = detectVectorEmbeddings(
            currentModel.getValue(),
          ).find((m) => m.range.start === placeholder.range.start)
          if (expandedMark) {
            userExpandedKeys.current.add(getEmbeddingKey(expandedMark))
          }
          return
        }

        // A click on the arrow of an expanded embedding collapses it again.
        const mark = detectVectorEmbeddings(currentText).find(
          (m) => offset >= m.range.start && offset <= m.range.end,
        )
        if (!mark) return
        e.event.preventDefault()
        userExpandedKeys.current.delete(getEmbeddingKey(mark))
        editor.executeEdits(EDIT_SOURCE, [
          {
            range: toMonacoRange(monaco, currentModel, mark.range),
            text: collapseVectorEmbeddingValue(
              currentText.slice(mark.range.start, mark.range.end),
              mark.dimensions,
            ),
          },
        ])
      })
    }

    // Copying a selection that contains collapsed embeddings puts the full
    // values on the clipboard instead of the placeholders.
    if (!removeCopyListener.current) {
      const domNode = editor.getContainerDomNode()
      const handleCopy = (e: ClipboardEvent) => {
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
      domNode.addEventListener('copy', handleCopy, true)
      removeCopyListener.current = () =>
        domNode.removeEventListener('copy', handleCopy, true)
    }
  }, [query, t, monacoObjects])

  // Detach the editor listeners on unmount.
  useEffect(
    () => () => {
      mouseListener.current?.dispose()
      mouseListener.current = null
      removeCopyListener.current?.()
      removeCopyListener.current = null
    },
    [],
  )
}
