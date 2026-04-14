import React from 'react'

import { DeleteConfirmationModal } from 'uiSrc/pages/vector-search/components/delete-confirmation-modal'

export interface DeleteIndexConfirmationProps {
  isOpen: boolean
  onConfirm: () => void
  onClose: () => void
}

export const DeleteIndexConfirmation = ({
  isOpen,
  onConfirm,
  onClose,
}: DeleteIndexConfirmationProps) => (
  <DeleteConfirmationModal
    isOpen={isOpen}
    title="Delete Index"
    question="Are you sure you want to delete this index?"
    message="Deleting the index will remove it from Search and Vector Search, but will not delete your underlying data."
    cancelLabel="Keep index"
    confirmLabel="Delete index"
    onConfirm={onConfirm}
    onCancel={onClose}
    testId="delete-index-modal"
  />
)
