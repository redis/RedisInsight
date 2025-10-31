import React from 'react'

import { Nullable } from 'uiSrc/utils'
import { RiFilePicker, UploadWarning } from 'uiSrc/components'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Loader, Modal } from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { CancelIcon } from 'uiSrc/components/base/icons'
import { Button } from 'uiSrc/components/base/forms/buttons'
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
    <Modal.Compose open>
      <Modal.Content.Compose className={styles.modal}>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onClose}
          data-testid="import-file-modal-close-btn"
        />
        <Modal.Content.Header.Title
          data-testid="import-file-modal-title"
          className={styles.marginTop2}
        >
          {!data && !error ? title : resultsTitle || 'Import Results'}
        </Modal.Content.Header.Title>
        <Modal.Content.Body.Compose className={styles.marginTop2}>
          <Col align="center">
            {warning && <FlexItem>{warning}</FlexItem>}
            <FlexItem>
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
                  <Loader size="xl" />
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
                <FlexItem grow className={styles.uploadWarningContainer}>
                  <UploadWarning />
                </FlexItem>
              )}
            </FlexItem>
          </Col>
          {data && (
            <Row justify="center">
              <FlexItem>{submitResults}</FlexItem>
            </Row>
          )}
        </Modal.Content.Body.Compose>
        <Modal.Content.Footer.Compose>
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
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default ImportFileModal
