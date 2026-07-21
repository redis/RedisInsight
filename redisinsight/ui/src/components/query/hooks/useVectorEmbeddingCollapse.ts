import { useEffect, useRef, useState } from 'react'
import { monaco as monacoEditor } from 'react-monaco-editor'

import { useTranslation } from 'uiSrc/i18n'
import {
  collapseVectorEmbeddingValue,
  detectVectorEmbeddings,
  expandVectorEmbeddings,
  findVectorEmbeddingPlaceholders,
  getEmbeddingKey,
  getVectorEmbeddingValue,
  Nullable,
  VectorEmbeddingRange,
} from 'uiSrc/utils'

import {
  UseVectorEmbeddingCollapseProps,
  UseVectorEmbeddingCollapseReturn,
} from './useVectorEmbeddingCollapse.types'

const EMBEDDING_HIDDEN_CLASS = 'monaco-vector-embedding-hidden'
// Collapsed label (chip) and standalone expanded arrow.
const EMBEDDING_TOGGLE_CLASS = 'monaco-vector-embedding-toggle'
const EMBEDDING_EXPAND_CLASS = 'monaco-vector-embedding-expand'
const ARROW_COLLAPSED = '▸'
const ARROW_EXPANDED = '▾'
const EDIT_SOURCE = 'vector-embedding-collapse'
const COPY_WIDGET_ID = 'vector-embedding-copy-widget'
// Grace period so moving the pointer from the chip to the floating button
// doesn't dismiss it.
const HOVER_HIDE_DELAY = 150

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
 * re-inserted at every exit path: expanding, copying and submitting/saving.
 *
 * Hovering a collapsed chip shows a floating copy button (a Monaco content
 * widget positioned above the chip) whose DOM node is returned so the host
 * component can portal the real CopyButton into it — a React component can't
 * be injected inline, but a content widget floats above the line and does not
 * disturb the query text.
 *
 * All detection and slicing works off the live model text (not the React
 * `query` state, which lags the model by a render). Every detected embedding
 * is collapsed unless the user explicitly expanded it, so a freshly pasted
 * embedding always starts collapsed.
 */
export const useVectorEmbeddingCollapse = ({
  monacoObjects,
  query,
}: UseVectorEmbeddingCollapseProps): UseVectorEmbeddingCollapseReturn => {
  const { t } = useTranslation()
  // Value shown by the floating copy button; null while it is hidden.
  const [copyValue, setCopyValue] = useState<Nullable<string>>(null)

  const decorationCollection =
    useRef<Nullable<monacoEditor.editor.IEditorDecorationsCollection>>(null)
  const mouseListener = useRef<Nullable<monacoEditor.IDisposable>>(null)
  const removeDomListeners = useRef<Nullable<() => void>>(null)
  // Content keys the user explicitly expanded; everything else auto-collapses.
  const userExpandedKeys = useRef<Set<string>>(new Set())

  // Floating copy-button widget: a portal target the host component renders
  // CopyButton into, plus the position that drives its visibility.
  const copyNode = useRef<Nullable<HTMLDivElement>>(null)
  if (!copyNode.current && typeof document !== 'undefined') {
    copyNode.current = document.createElement('div')
  }
  const copyWidget = useRef<Nullable<monacoEditor.editor.IContentWidget>>(null)
  const copyPosition = useRef<Nullable<monacoEditor.IPosition>>(null)
  const hideTimer = useRef<Nullable<ReturnType<typeof setTimeout>>>(null)
  const moveListener = useRef<Nullable<monacoEditor.IDisposable>>(null)
  // Placeholder id the copy button is currently shown for (dedupes mousemove).
  const shownPlaceholderId = useRef<Nullable<number>>(null)

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
        },
      })
    })

    // Expanded embeddings (a raw blob the user chose to show): a collapse
    // arrow chip over the first character of the value.
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

    if (mouseListener.current) return

    const cancelHide = () => {
      if (hideTimer.current) {
        clearTimeout(hideTimer.current)
        hideTimer.current = null
      }
    }

    const hideCopy = () => {
      cancelHide()
      hideTimer.current = setTimeout(() => {
        copyPosition.current = null
        shownPlaceholderId.current = null
        setCopyValue(null)
        if (copyWidget.current) editor.layoutContentWidget(copyWidget.current)
      }, HOVER_HIDE_DELAY)
    }

    const showCopyAt = (offset: number) => {
      const currentModel = editor.getModel()
      if (!currentModel) return
      const placeholder = findVectorEmbeddingPlaceholders(
        currentModel.getValue(),
      ).find((p) => offset >= p.range.start && offset <= p.range.end)
      const value = placeholder
        ? getVectorEmbeddingValue(placeholder.id)
        : undefined
      if (value === undefined || !placeholder) {
        hideCopy()
        return
      }
      cancelHide()
      // Already showing this one — don't churn state on every mousemove.
      if (shownPlaceholderId.current === placeholder.id) return
      shownPlaceholderId.current = placeholder.id
      copyPosition.current = currentModel.getPositionAt(placeholder.range.start)
      setCopyValue(value)
      if (copyWidget.current) editor.layoutContentWidget(copyWidget.current)
    }

    // Register the copy widget and portal-target node once.
    if (!copyWidget.current && copyNode.current) {
      const node = copyNode.current
      node.addEventListener('mouseenter', cancelHide)
      node.addEventListener('mouseleave', hideCopy)
      copyWidget.current = {
        getId: () => COPY_WIDGET_ID,
        getDomNode: () => node,
        getPosition: () =>
          copyPosition.current
            ? {
                position: copyPosition.current,
                preference: [
                  monaco.editor.ContentWidgetPositionPreference.ABOVE,
                  monaco.editor.ContentWidgetPositionPreference.BELOW,
                ],
              }
            : null,
      }
      editor.addContentWidget(copyWidget.current)
    }

    // Show the copy button while hovering a collapsed chip; hide otherwise.
    // Use Monaco's mouse event (same target resolution as onMouseDown) — a raw
    // DOM mouseover can't resolve a model position for injected-text spans.
    moveListener.current = editor.onMouseMove((e) => {
      const element = e.target.element as HTMLElement | null
      if (
        element?.classList.contains(EMBEDDING_TOGGLE_CLASS) &&
        e.target.position
      ) {
        const currentModel = editor.getModel()
        if (currentModel) {
          showCopyAt(currentModel.getOffsetAt(e.target.position))
        }
        return
      }
      hideCopy()
    })

    // Copying a selection that contains collapsed embeddings puts the full
    // values on the clipboard instead of the placeholders.
    const domNode = editor.getContainerDomNode()
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

    domNode.addEventListener('mouseleave', hideCopy)
    domNode.addEventListener('copy', handleCopyEvent, true)
    removeDomListeners.current = () => {
      domNode.removeEventListener('mouseleave', hideCopy)
      domNode.removeEventListener('copy', handleCopyEvent, true)
    }

    mouseListener.current = editor.onMouseDown((e) => {
      const element = e.target.element as HTMLElement | null
      const classList = element?.classList
      if (
        !classList?.contains(EMBEDDING_TOGGLE_CLASS) &&
        !classList?.contains(EMBEDDING_EXPAND_CLASS)
      ) {
        return
      }

      const { position } = e.target
      const currentModel = editor.getModel()
      if (!position || !currentModel) return

      const currentText = currentModel.getValue()
      const offset = currentModel.getOffsetAt(position)

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
  }, [query, t, monacoObjects])

  // Re-layout the widget after the portal has rendered CopyButton into it, so
  // Monaco positions it against the real button size (not the empty node).
  useEffect(() => {
    const editor = monacoObjects.current?.editor
    if (editor && copyWidget.current) {
      editor.layoutContentWidget(copyWidget.current)
    }
  }, [copyValue, monacoObjects])

  // Detach the editor listeners and widget on unmount.
  useEffect(
    () => () => {
      if (hideTimer.current) clearTimeout(hideTimer.current)
      mouseListener.current?.dispose()
      mouseListener.current = null
      moveListener.current?.dispose()
      moveListener.current = null
      removeDomListeners.current?.()
      removeDomListeners.current = null
      const editor = monacoObjects.current?.editor
      if (editor && copyWidget.current) {
        editor.removeContentWidget(copyWidget.current)
      }
    },
    [monacoObjects],
  )

  return { copyWidgetNode: copyNode.current, copyValue }
}
