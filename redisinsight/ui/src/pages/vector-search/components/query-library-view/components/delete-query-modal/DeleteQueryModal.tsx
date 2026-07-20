import React from 'react'

import { useTranslation } from 'uiSrc/i18n'
import { DeleteConfirmationModal } from 'uiSrc/pages/vector-search/components/delete-confirmation-modal'

import { DeleteQueryModalProps } from './DeleteQueryModal.types'

export const DeleteQueryModal = ({
  onConfirm,
  onCancel,
}: DeleteQueryModalProps) => {
  const { t } = useTranslation()

  return (
    <DeleteConfirmationModal
      isOpen
      title={t('vectorSearch.queryLibrary.delete.title')}
      question={t('vectorSearch.queryLibrary.delete.question')}
      message={t('vectorSearch.queryLibrary.delete.message')}
      cancelLabel={t('vectorSearch.queryLibrary.delete.cancel')}
      confirmLabel={t('vectorSearch.queryLibrary.delete.confirm')}
      onConfirm={onConfirm}
      onCancel={onCancel}
      testId="query-library-delete-modal"
    />
  )
}
