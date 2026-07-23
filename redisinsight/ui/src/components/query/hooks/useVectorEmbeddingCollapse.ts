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
  handleCopy,
  Nullable,
} from 'uiSrc/utils'

import { UseVectorEmbeddingCollapseProps } from './useVectorEmbeddingCollapse.types'
import {
  ARROW_COLLAPSED,
  ARROW_EXPANDED,
  COLLAPSE_EDIT_SOURCE,
  COPIED_ICON,
  COPIED_RESET_MS,
  COPY_ICON,
  EMBEDDING_COPY_CLASS,
  EMBEDDING_EXPAND_CLASS,
  EMBEDDING_HIDDEN_CLASS,
  EMBEDDING_TOGGLE_CLASS,
} from './useVectorEmbeddingCollapse.constants'
import { findAtOffset, toMonacoRange } from './useVectorEmbeddingCollapse.utils'

/**
 * Collapses every detected embedding to a placeholder chip in the model and
 * expands it back on click. The full value lives in the placeholder store and
 * is restored at every exit path (expand, copy, submit, save). Detection runs
 * off the live model text; embeddings start collapsed unless explicitly
 * expanded.
 */
export const useVectorEmbeddingCollapse = ({
  monacoObjects,
  query,
}: UseVectorEmbeddingCollapseProps) => {
  const { t } = useTranslation()
  // Placeholder id whose copy button currently shows the "copied" tick.
  const [copiedId, setCopiedId] = useState<Nullable<string>>(null)
  // monacoObjects is a ref, so a late editorDidMount doesn't retrigger the
  // effects below. This flag flips once the editor is attached, guaranteeing
  // the first collapse/listener pass runs even if `query` never changes.
  const [isEditorReady, setIsEditorReady] = useState(false)
  const decorationCollection =
    useRef<Nullable<monacoEditor.editor.IEditorDecorationsCollection>>(null)
  const userExpandedKeys = useRef<Set<string>>(new Set())
  const copiedTimer = useRef<Nullable<ReturnType<typeof setTimeout>>>(null)
  // Set when the last model change was an undo/redo, so the next pass does not
  // re-collapse embedding text that the user is trying to step back to.
  const skipAutoCollapseOnce = useRef(false)

  useEffect(() => {
    if (isEditorReady) return undefined
    let frame = 0
    const waitForEditor = () => {
      if (monacoObjects.current) {
        setIsEditorReady(true)
        return
      }
      frame = requestAnimationFrame(waitForEditor)
    }
    waitForEditor()
    return () => cancelAnimationFrame(frame)
  }, [isEditorReady, monacoObjects])

  // Auto-collapse detected embeddings and (re)draw the placeholder chips. Runs
  // whenever the query text or the copied-tick state changes.
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

    // Drop expanded keys whose embedding is no longer in the editor (cleared,
    // replaced, deleted) so a later paste always starts collapsed.
    const detectedKeys = new Set(detected.map(getEmbeddingKey))
    userExpandedKeys.current = new Set(
      [...userExpandedKeys.current].filter((key) => detectedKeys.has(key)),
    )

    const marksToCollapse = detected.filter(
      (mark) => !userExpandedKeys.current.has(getEmbeddingKey(mark)),
    )
    // An undo/redo restored raw embedding text. Mark it user-expanded rather
    // than just skipping this one pass, so an unrelated later re-render (e.g.
    // the copied-tick timer) does not re-collapse it and defeat the undo.
    const isUndoRestore = skipAutoCollapseOnce.current
    skipAutoCollapseOnce.current = false
    if (marksToCollapse.length > 0 && isUndoRestore) {
      marksToCollapse.forEach((mark) =>
        userExpandedKeys.current.add(getEmbeddingKey(mark)),
      )
    } else if (marksToCollapse.length > 0) {
      // Undo stops keep the collapse a separate undo entry from the paste/type
      // that produced the vector, so Ctrl+Z first lands on the raw value (where
      // the isUndoing guard keeps it expanded) instead of skipping past it.
      editor.pushUndoStop()
      // executeEdits remaps the caret next to the placeholder — don't restore a
      // pre-edit selection, whose columns are stale once the long blob is gone.
      editor.executeEdits(
        COLLAPSE_EDIT_SOURCE,
        marksToCollapse.map((mark) => ({
          range: toMonacoRange(monaco, model, mark.range),
          text: collapseVectorEmbeddingValue(
            text.slice(mark.range.start, mark.range.end),
            mark.dimensions,
            mark.byteSize,
          ),
        })),
      )
      editor.pushUndoStop()
      // A paste scrolls the view to the end of the long blob; once it collapses,
      // bring the view back to the caret (now beside the placeholder) so it
      // doesn't stay parked at the bottom.
      const position = editor.getPosition()
      if (position) editor.revealPositionInCenterIfOutsideViewport(position)
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

      // Hide the placeholder text (else the tokenizer colours it) and draw the
      // chip as injected spans; label and copy button hover independently.
      decorations.push(
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
      )

      // Only offer copy when the value is retrievable this session; a stale or
      // foreign placeholder can't be copied, so don't draw a dead button.
      if (getVectorEmbeddingValue(placeholder.id) !== undefined) {
        decorations.push({
          range: toMonacoRange(monaco, model, { start: end - 1, end }),
          options: {
            hoverMessage: { value: t('query.editor.vectorEmbedding.copy') },
            after: {
              content: placeholder.id === copiedId ? COPIED_ICON : COPY_ICON,
              inlineClassName: EMBEDDING_COPY_CLASS,
            },
          },
        })
      }
    })

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
  }, [query, t, copiedId, monacoObjects, isEditorReady])

  // Wire the editor-level listeners once the editor is attached. Kept separate
  // from the decoration pass so the handlers aren't rebuilt on every query or
  // copied-tick change; they read live model state, so they never go stale.
  useEffect(() => {
    if (!isEditorReady || !monacoObjects.current) return undefined
    const { editor, monaco } = monacoObjects.current
    const domNode = editor.getContainerDomNode()

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
      const currentText = currentModel.getValue()
      const mouseTarget = editor.getTargetAtClientPoint(e.clientX, e.clientY)
      const offset = mouseTarget?.position
        ? currentModel.getOffsetAt(mouseTarget.position)
        : null

      if (isExpandArrow) {
        const mark = findAtOffset(detectVectorEmbeddings(currentText), offset)
        if (!mark) return
        const selection = editor.getSelection()
        userExpandedKeys.current.delete(getEmbeddingKey(mark))
        // Undo stops keep this manual collapse its own undo entry, so Ctrl+Z
        // undoes only the collapse and not a preceding edit to the vector.
        editor.pushUndoStop()
        editor.executeEdits(COLLAPSE_EDIT_SOURCE, [
          {
            range: toMonacoRange(monaco, currentModel, mark.range),
            text: collapseVectorEmbeddingValue(
              currentText.slice(mark.range.start, mark.range.end),
              mark.dimensions,
              mark.byteSize,
            ),
          },
        ])
        editor.pushUndoStop()
        if (selection) editor.setSelection(selection)
        return
      }

      const placeholder = findAtOffset(
        findVectorEmbeddingPlaceholders(currentText),
        offset,
      )
      if (!placeholder) return
      const value = getVectorEmbeddingValue(placeholder.id)
      if (value === undefined) return

      if (isCopy) {
        handleCopy(value)
        setCopiedId(placeholder.id)
        if (copiedTimer.current) clearTimeout(copiedTimer.current)
        copiedTimer.current = setTimeout(
          () => setCopiedId(null),
          COPIED_RESET_MS,
        )
        return
      }

      const selection = editor.getSelection()
      // Undo stops keep this manual expand its own undo entry, symmetric with
      // the collapse paths, so Ctrl+Z steps through it cleanly.
      editor.pushUndoStop()
      editor.executeEdits(COLLAPSE_EDIT_SOURCE, [
        {
          range: toMonacoRange(monaco, currentModel, placeholder.range),
          text: value,
        },
      ])
      editor.pushUndoStop()
      // Keep the stored value: an undo can restore the placeholder text, and it
      // must still resolve on expand/copy/submit. The store is session-scoped.
      const expandedMark = detectVectorEmbeddings(currentModel.getValue()).find(
        (m) => m.range.start === placeholder.range.start,
      )
      if (expandedMark)
        userExpandedKeys.current.add(getEmbeddingKey(expandedMark))
      if (selection) editor.setSelection(selection)
    }

    // Copy/cut with full values instead of placeholders; cut also removes the
    // selection since we take over the clipboard write. Every cursor/selection
    // is handled (not just the primary), ordered top-to-bottom, so a
    // multi-selection copy/cut never drops ranges or leaves raw placeholders.
    const writeExpandedClipboard = (e: ClipboardEvent, isCut: boolean) => {
      const currentModel = editor.getModel()
      const selections = editor.getSelections()
      if (!currentModel || !selections?.length || !e.clipboardData) return

      const ordered = [...selections].sort(
        (a, b) =>
          currentModel.getOffsetAt(a.getStartPosition()) -
          currentModel.getOffsetAt(b.getStartPosition()),
      )
      const parts = ordered.map((range) => currentModel.getValueInRange(range))
      const selected = parts.join('\n')
      const expanded = parts.map(expandVectorEmbeddings).join('\n')
      if (expanded === selected) return

      e.preventDefault()
      e.stopPropagation()
      e.clipboardData.setData('text/plain', expanded)
      if (isCut) {
        editor.executeEdits(
          COLLAPSE_EDIT_SOURCE,
          ordered.map((range) => ({ range, text: '' })),
        )
      }
    }
    const handleCopyEvent = (e: ClipboardEvent) =>
      writeExpandedClipboard(e, false)
    const handleCutEvent = (e: ClipboardEvent) =>
      writeExpandedClipboard(e, true)

    const contentChangeSub = editor.onDidChangeModelContent((e) => {
      if (e.isUndoing || e.isRedoing) skipAutoCollapseOnce.current = true
    })

    domNode.addEventListener('mousedown', handleChipMouseDown, true)
    domNode.addEventListener('copy', handleCopyEvent, true)
    domNode.addEventListener('cut', handleCutEvent, true)

    return () => {
      domNode.removeEventListener('mousedown', handleChipMouseDown, true)
      domNode.removeEventListener('copy', handleCopyEvent, true)
      domNode.removeEventListener('cut', handleCutEvent, true)
      contentChangeSub.dispose()
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    }
  }, [monacoObjects, isEditorReady])
}
