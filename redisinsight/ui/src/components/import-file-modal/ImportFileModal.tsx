import React from 'react'

import { Nullable } from 'uiSrc/utils'
import { RiFilePicker, UploadWarning } from 'uiSrc/components'
import { RiCol, RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { RiLoader, RiModal } from 'uiSrc/components/base/display'
import { RiIcon, CancelIcon } from 'uiSrc/components/base/icons'
import { Button } from 'uiSrc/components/base/forms'
import styles from './styles.module.scss'

export interface Props<T> {
  onClose: () => void
  onFileChange: (files: FileList | null) => void
  onSubmit: () => void
  title: string
  resultsTitle?: string
  submitResults: JSX.Element
  loading: boolean
  data: Nullable<T>
  warning?: JSX.Element | null
  error?: string
  errorMessage?: string
  invalidMessage?: string
  isInvalid: boolean
  isSubmitDisabled: boolean
  submitBtnText?: string
  acceptedFileExtension?: string
}

const ImportFileModal = <T,>({
  onClose,
  onFileChange,
  onSubmit,
  title,
  resultsTitle,
  submitResults,
  loading,
  data,
  warning,
  error,
  errorMessage,
  invalidMessage,
  isInvalid,
  isSubmitDisabled,
  submitBtnText,
  acceptedFileExtension,
}: Props<T>) => {
  const isShowForm = !loading && !data && !error
  return (
    <RiModal.Compose open>
      <RiModal.Content.Compose className={styles.modal}>
        <RiModal.Content.Close
          icon={CancelIcon}
          onClick={onClose}
          data-testid="import-file-modal-close-btn"
        />
        <RiModal.Content.Header.Title
          data-testid="import-file-modal-title"
          className={styles.marginTop2}
        >
          {!data && !error ? title : resultsTitle || 'Import Results'}
        </RiModal.Content.Header.Title>
        <RiModal.Content.Body.Compose className={styles.marginTop2}>
          <RiCol align="center">
            {warning && <RiFlexItem>{warning}</RiFlexItem>}
            <RiFlexItem>
              {isShowForm && (
                <>
                  <RiFilePicker
                    id="import-file-modal-filepicker"
                    initialPromptText="Select or drag and drop a file"
                    className={styles.fileDrop}
                    isInvalid={isInvalid}
                    onChange={onFileChange}
                    display="large"
                    accept={acceptedFileExtension}
                    data-testid="import-file-modal-filepicker"
                    aria-label="Select or drag and drop file"
                  />
                  {isInvalid && (
                    <ColorText
                      color="danger"
                      className={styles.errorFileMsg}
                      data-testid="input-file-error-msg"
                    >
                      {invalidMessage}
                    </ColorText>
                  )}
                </>
              )}
              {loading && (
                <div
                  className={styles.loading}
                  data-testid="file-loading-indicator"
                >
                  <RiLoader size="xl" />
                  <Text color="subdued" style={{ marginTop: 12 }}>
                    Uploading...
                  </Text>
                </div>
              )}
              {error && (
                <div className={styles.result} data-testid="result-failed">
                  <RiIcon type="ToastCancelIcon" size="xxl" color="danger500" />
                  <Text color="subdued" style={{ marginTop: 16 }}>
                    {errorMessage}
                  </Text>
                  <Text color="subdued">{error}</Text>
                </div>
              )}
              {isShowForm && (
                <RiFlexItem grow className={styles.uploadWarningContainer}>
                  <UploadWarning />
                </RiFlexItem>
              )}
            </RiFlexItem>
          </RiCol>
          {data && (
            <RiRow justify="center">
              <RiFlexItem>{submitResults}</RiFlexItem>
            </RiRow>
          )}
        </RiModal.Content.Body.Compose>
        <RiModal.Content.Footer.Compose>
          {isShowForm && (
            <>
              <Button
                variant="secondary-invert"
                onClick={onClose}
                data-testid="cancel-btn"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={onSubmit}
                disabled={isSubmitDisabled}
                data-testid="submit-btn"
              >
                {submitBtnText || 'Import'}
              </Button>
            </>
          )}
          {data && (
            <Button variant="primary" onClick={onClose}>
              OK
            </Button>
          )}
        </RiModal.Content.Footer.Compose>
      </RiModal.Content.Compose>
    </RiModal.Compose>
  )
}

export default ImportFileModal
