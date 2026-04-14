export interface SaveQueryModalProps {
  isOpen: boolean
  isSaving: boolean
  onSave: (name: string) => Promise<void>
  onClose: () => void
}
