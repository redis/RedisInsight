import React from 'react'

import { RiCol, RiFlexItem, RiRow } from 'uiBase/layout'
import { RiColorText, RiText } from 'uiBase/text'
import { RiLoader, RiModal } from 'uiBase/display'
import { RiIcon, CancelIcon } from 'uiBase/icons'
import { Button, RiFilePicker } from 'uiBase/forms'
import { Nullable } from 'uiSrc/utils'
import { UploadWarning } from 'uiSrc/components'

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
                    <RiColorText
                      color="danger"
                      className={styles.errorFileMsg}
                      data-testid="input-file-error-msg"
                    >
                      {invalidMessage}
                    </RiColorText>
                  )}
                </>
              )}
              {loading && (
                <div
                  className={styles.loading}
                  data-testid="file-loading-indicator"
                >
                  <RiLoader size="xl" />
                  <RiText color="subdued" style={{ marginTop: 12 }}>
                    Uploading...
                  </RiText>
                </div>
              )}
              {error && (
                <div className={styles.result} data-testid="result-failed">
                  <RiIcon type="ToastCancelIcon" size="xxl" color="danger500" />
                  <RiText color="subdued" style={{ marginTop: 16 }}>
                    {errorMessage}
                  </RiText>
                  <RiText color="subdued">{error}</RiText>
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
