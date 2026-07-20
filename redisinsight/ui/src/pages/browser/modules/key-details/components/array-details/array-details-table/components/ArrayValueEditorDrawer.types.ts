export interface ArrayValueEditorDrawerProps {
  isOpen: boolean
  index: string
  /** Serialized value the editor is re-seeded with on each open. */
  initialValue: string
  title?: string
  /** Blocks Save while a write / patched-view read is in flight. */
  isSaveDisabled?: boolean
  onSave: (value: string) => void
  onClose: () => void
}
