export interface SaveQueryModalProps {
  isOpen: boolean
  isSaving: boolean
  onSave: (name: string) => void
  onClose: () => void
}
