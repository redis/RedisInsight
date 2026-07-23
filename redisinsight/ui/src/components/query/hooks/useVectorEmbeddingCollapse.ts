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
  // collapse effect. This flag flips once the editor is attached, guaranteeing
  // the first collapse pass runs even if `query` never changes afterwards.
  const [isEditorReady, setIsEditorReady] = useState(false)
  const decorationCollection =
    useRef<Nullable<monacoEditor.editor.IEditorDecorationsCollection>>(null)
  const removeDomListeners = useRef<Nullable<() => void>>(null)
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
      // Preserve the caret so a collapse triggered mid-edit (e.g. finishing a
      // large array) doesn't yank the cursor elsewhere; Monaco maps it across
      // the edit like the manual expand/collapse handlers do.
      const selection = editor.getSelection()
      // Undo stops keep the collapse a separate undo entry from the paste/type
      // that produced the vector, so Ctrl+Z first lands on the raw value (where
      // the isUndoing guard keeps it expanded) instead of skipping past it.
      editor.pushUndoStop()
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
      if (selection) editor.setSelection(selection)
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
        {
          range: toMonacoRange(monaco, model, { start: end - 1, end }),
          options: {
            hoverMessage: { value: t('query.editor.vectorEmbedding.copy') },
            after: {
              content: placeholder.id === copiedId ? COPIED_ICON : COPY_ICON,
              inlineClassName: EMBEDDING_COPY_CLASS,
            },
          },
        },
      )
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

    if (removeDomListeners.current) return

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
      editor.executeEdits(COLLAPSE_EDIT_SOURCE, [
        {
          range: toMonacoRange(monaco, currentModel, placeholder.range),
          text: value,
        },
      ])
      // Keep the stored value: an undo can restore the placeholder text, and it
      // must still resolve on expand/copy/submit. The store is session-scoped.
      const expandedMark = detectVectorEmbeddings(currentModel.getValue()).find(
        (m) => m.range.start === placeholder.range.start,
      )
      if (expandedMark)
        userExpandedKeys.current.add(getEmbeddingKey(expandedMark))
      if (selection) editor.setSelection(selection)
    }

    // Copy/cut a selection with full values instead of placeholders; cut also
    // removes the selection since we take over the clipboard write.
    const writeExpandedClipboard = (e: ClipboardEvent, isCut: boolean) => {
      const selection = editor.getSelection()
      const currentModel = editor.getModel()
      if (!selection || !currentModel || !e.clipboardData) return

      const selected = currentModel.getValueInRange(selection)
      const expanded = expandVectorEmbeddings(selected)
      if (expanded === selected) return

      e.preventDefault()
      e.stopPropagation()
      e.clipboardData.setData('text/plain', expanded)
      if (isCut) {
        editor.executeEdits(COLLAPSE_EDIT_SOURCE, [
          { range: selection, text: '' },
        ])
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
    removeDomListeners.current = () => {
      domNode.removeEventListener('mousedown', handleChipMouseDown, true)
      domNode.removeEventListener('copy', handleCopyEvent, true)
      domNode.removeEventListener('cut', handleCutEvent, true)
      contentChangeSub.dispose()
    }
  }, [query, t, copiedId, monacoObjects, isEditorReady])

  useEffect(
    () => () => {
      removeDomListeners.current?.()
      removeDomListeners.current = null
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
    },
    [],
  )
}
