import React, { useState } from 'react'

import { Text } from 'uiSrc/components/base/text'
import ImportFileModal from 'uiSrc/components/import-file-modal'
import { useTranslation } from 'uiSrc/i18n'

export interface Props {
  onClose: () => void
  onConfirm: () => void
  onFileChange: (file: File) => void
  isUploaded: boolean
  showWarning: boolean
  error?: string
  loading: boolean
}

const UploadDialog = ({
  onClose,
  onConfirm,
  onFileChange,
  isUploaded,
  showWarning,
  error,
  loading,
}: Props) => {
  const { t } = useTranslation()
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)

  const handleFileChange = (files: FileList | null) => {
    if (!files?.length) {
      setIsSubmitDisabled(true)
    } else {
      onFileChange(files[0])
      setIsSubmitDisabled(false)
    }
  }

  return (
    <ImportFileModal
      onClose={onClose}
      onFileChange={handleFileChange}
      onSubmit={onConfirm}
      title={
        showWarning
          ? t('rdi.pipeline.upload.titleNew')
          : t('rdi.pipeline.upload.titleArchive')
      }
      resultsTitle={
        !error
          ? t('rdi.pipeline.upload.resultSuccess')
          : t('rdi.pipeline.upload.resultFail')
      }
      submitResults={<Text>{t('rdi.pipeline.upload.submitResults')}</Text>}
      loading={loading}
      data={isUploaded}
      warning={
        showWarning ? (
          <Text data-testid="input-file-warning">
            {t('rdi.pipeline.upload.warning')}
          </Text>
        ) : null
      }
      error={error}
      errorMessage={t('rdi.pipeline.upload.errorZip')}
      isInvalid={false}
      isSubmitDisabled={isSubmitDisabled}
      submitBtnText={t('rdi.pipeline.upload.submitButton')}
      acceptedFileExtension=".zip"
    />
  )
}

export default UploadDialog
