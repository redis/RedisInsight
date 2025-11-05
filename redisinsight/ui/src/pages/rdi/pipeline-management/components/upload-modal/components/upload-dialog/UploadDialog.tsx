import React, { useState } from "react"

import { Text } from "uiSrc/components/base/text"
import ImportFileModal from "uiSrc/components/import-file-modal"

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
  "If a new pipeline is uploaded, existing pipeline configuration and transformation\n" +
  "jobs will be overwritten. Changes will not be applied until the pipeline is deployed."

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
          ? "Upload a new pipeline"
          : "Upload an archive with an RDI pipeline"
      }
      resultsTitle={
        !error ? "Pipeline has been uploaded" : "Failed to upload pipeline"
      }
      submitResults={
        <Text>A new pipeline has been successfully uploaded.</Text>
      }
      loading={loading}
      data={isUploaded}
      warning={
        showWarning ? (
          <Text data-testid="input-file-warning">{warningMessage}</Text>
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
