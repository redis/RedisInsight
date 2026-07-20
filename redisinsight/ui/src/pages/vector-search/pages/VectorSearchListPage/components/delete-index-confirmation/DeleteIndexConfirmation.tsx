import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
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
}: DeleteIndexConfirmationProps) => {
  const { t } = useTranslation()
  return (
    <DeleteConfirmationModal
      isOpen={isOpen}
      title={t('vectorSearch.list.delete.title')}
      question={t('vectorSearch.list.delete.question')}
      message={t('vectorSearch.list.delete.message')}
      cancelLabel={t('vectorSearch.list.delete.cancel')}
      confirmLabel={t('vectorSearch.list.delete.confirm')}
      onConfirm={onConfirm}
      onCancel={onClose}
      testId="delete-index-modal"
    />
  )
}
