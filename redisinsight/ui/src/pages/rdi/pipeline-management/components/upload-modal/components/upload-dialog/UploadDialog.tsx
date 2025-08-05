import React, { useState } from 'react'

import { Text } from 'uiSrc/components/base/text'
import ImportFileModal from 'uiSrc/components/import-file-modal'

import { RiIcon } from 'uiSrc/components/base/icons'
import styles from './styles.module.scss'

export interface Props {
  onClose: () => void
  onConfirm: () => void
  onFileChange: (file: File) => void
  isUploaded: boolean
  showWarning: boolean
  error?: string
  loading: boolean
}

const warningMessage =
  'If a new pipeline is uploaded, existing pipeline configuration and transformation\n' +
  'jobs will be overwritten. Changes will not be applied until the pipeline is deployed.'

const UploadDialog = ({
  onClose,
  onConfirm,
  onFileChange,
  isUploaded,
  showWarning,
  error,
  loading,
}: Props) => {
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
          ? 'Upload a new pipeline'
          : 'Upload an archive with an RDI pipeline'
      }
      resultsTitle={
        !error ? 'Pipeline has been uploaded' : 'Failed to upload pipeline'
      }
      submitResults={
        <div className={styles.result} data-testid="result-succeeded">
          <Text color="subdued">
            A new pipeline has been successfully uploaded.
          </Text>
        </div>
      }
      loading={loading}
      data={isUploaded}
      warning={
        showWarning ? (
          <div className={styles.warning} data-testid="input-file-warning">
            <Text size="s" color="subdued">
              <RiIcon
                type="ToastDangerIcon"
                className={styles.alertIcon}
                size="m"
              />
              {warningMessage}
            </Text>
          </div>
        ) : null
      }
      error={error}
      errorMessage="There was a problem with the .zip file"
      isInvalid={false}
      isSubmitDisabled={isSubmitDisabled}
      submitBtnText="Upload"
      acceptedFileExtension=".zip"
    />
  )
}

export default UploadDialog
