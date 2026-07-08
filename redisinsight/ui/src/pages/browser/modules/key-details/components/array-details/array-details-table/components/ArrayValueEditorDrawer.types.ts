export interface ArrayValueEditorDrawerProps {
  isOpen: boolean
  index: string
  /** Serialized value the editor is re-seeded with on each open. */
  initialValue: string
  title?: string
  onSave: (value: string) => void
  onClose: () => void
}
