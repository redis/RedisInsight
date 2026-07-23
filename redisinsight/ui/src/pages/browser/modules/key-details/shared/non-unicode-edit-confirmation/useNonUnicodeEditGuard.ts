import { useCallback, useState } from 'react'

import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import {
  defaultViewFormat,
  selectedKeySelector,
  setViewFormat,
} from 'uiSrc/slices/browser/keys'
import { isFormatEditable } from 'uiSrc/utils'
import { KeyValueFormat } from 'uiSrc/constants'

// Non-editable formats can't be edited at all, so only warn for an
// editable non-Unicode format.
const needsEditWarning = (format: KeyValueFormat) =>
  format !== KeyValueFormat.Unicode && isFormatEditable(format)

interface Options {
  /**
   * Re-run the pending edit after switching to Unicode. Disable where the
   * editor snapshots its value under the opening format (e.g. the array drawer).
   */
  reenterAfterUnicode?: boolean
}

/**
 * Guards entering edit mode: for a non-Unicode format it opens the
 * confirmation and defers the edit; otherwise it proceeds immediately.
 */
export const useNonUnicodeEditGuard = ({
  reenterAfterUnicode = true,
}: Options = {}) => {
  const { viewFormat } = useAppSelector(selectedKeySelector)
  const dispatch = useAppDispatch()

  const format = viewFormat ?? defaultViewFormat

  const [isOpen, setIsOpen] = useState(false)
  const [pendingEdit, setPendingEdit] = useState<(() => void) | null>(null)

  // Stable identities so consumers can memoize the UI around the popover.
  const requestEdit = useCallback(
    (proceed: () => void) => {
      if (!needsEditWarning(format)) {
        proceed()
        return
      }
      // Store the callback (wrapped so setState does not invoke it).
      setPendingEdit(() => proceed)
      setIsOpen(true)
    },
    [format],
  )

  const cancel = useCallback(() => {
    setIsOpen(false)
    setPendingEdit(null)
  }, [])

  const editAnyway = useCallback(() => {
    setIsOpen(false)
    pendingEdit?.()
    setPendingEdit(null)
  }, [pendingEdit])

  const changeToUnicode = useCallback(() => {
    const proceed = pendingEdit
    dispatch(setViewFormat(KeyValueFormat.Unicode))
    setIsOpen(false)
    setPendingEdit(null)
    // Defer past the table's format-change reset (which clears edit state)
    // so the row reopens in place on its raw Unicode value.
    if (reenterAfterUnicode && proceed) {
      setTimeout(proceed, 0)
    }
  }, [pendingEdit, dispatch, reenterAfterUnicode])

  return {
    format,
    isOpen,
    requestEdit,
    cancel,
    editAnyway,
    changeToUnicode,
  }
}
