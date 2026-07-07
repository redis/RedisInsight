import React from 'react'

export interface ArrayValueEditorModalProps {
  /** Controls modal visibility. */
  isOpen: boolean
  /** Index of the element being edited (used for stable test ids). */
  index: string
  /** Serialized value the editor is seeded with each time it opens. */
  initialValue: string
  /** Optional modal title. */
  title?: React.ReactNode
  /** Called with the current editor value when the user clicks Save. */
  onSave: (value: string) => void
  /** Called when the user cancels or closes the modal. */
  onClose: () => void
}
