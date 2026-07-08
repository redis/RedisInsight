export interface ArrayValueEditorDrawerProps {
  /** Controls drawer visibility. */
  isOpen: boolean
  /** Index of the element being edited (used in the Save button's aria-label). */
  index: string
  /** Serialized value the editor is seeded with each time it opens. */
  initialValue: string
  /** Optional drawer title. */
  title?: string
  /** Called with the current editor value when the user clicks Save. */
  onSave: (value: string) => void
  /** Called when the user cancels or closes the drawer. */
  onClose: () => void
}
