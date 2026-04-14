import React from 'react'

import { DeleteConfirmationModal } from 'uiSrc/pages/vector-search/components/delete-confirmation-modal'

import { DeleteQueryModalProps } from './DeleteQueryModal.types'

export const DeleteQueryModal = ({
  onConfirm,
  onCancel,
}: DeleteQueryModalProps) => (
  <DeleteConfirmationModal
    isOpen
    title="Delete query"
    question="Are you sure you want to delete this query?"
    message="This action will remove the saved query, but won't affect your index or data."
    cancelLabel="Keep query"
    confirmLabel="Delete query"
    onConfirm={onConfirm}
    onCancel={onCancel}
    testId="query-library-delete-modal"
  />
)
