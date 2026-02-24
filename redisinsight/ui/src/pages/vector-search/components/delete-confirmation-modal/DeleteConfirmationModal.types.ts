export interface DeleteConfirmationModalProps {
  isOpen: boolean
  title: string
  question: string
  message: string
  cancelLabel: string
  confirmLabel: string
  onConfirm: () => void
  onCancel: () => void
  testId?: string
}
