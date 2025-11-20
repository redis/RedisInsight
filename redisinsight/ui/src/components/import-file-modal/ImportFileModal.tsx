import React from 'react'

import { Nullable } from 'uiSrc/utils'
import { RiFilePicker, UploadWarning } from 'uiSrc/components'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Loader, Modal } from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import { CancelIcon } from 'uiSrc/components/base/icons'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
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
      <Modal.Content.Compose persistent>
        <Modal.Content.Close
          icon={CancelIcon}
          onClick={onClose}
          data-testid="import-file-modal-close-btn"
        />

        <Modal.Content.Header.Compose>
          <Modal.Content.Header.Title data-testid="import-file-modal-title">
            {!data && !error ? title : resultsTitle || 'Import Results'}
          </Modal.Content.Header.Title>
        </Modal.Content.Header.Compose>

        <Modal.Content.Body
          width="610px"
          content={
            <Col gap="l">
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
                    <RiIcon
                      type="ToastCancelIcon"
                      size="xxl"
                      color="danger500"
                    />
                    <Text style={{ marginTop: 16 }}>{errorMessage}</Text>
                    <Text>{error}</Text>
                  </div>
                )}
              </FlexItem>
              {isShowForm && (
                <FlexItem grow>
                  <UploadWarning />
                </FlexItem>
              )}
            </Col>
          }
        />

        {data && (
          <Modal.Content.Body
            content={submitResults}
            data-testid="result-succeeded"
          />
        )}
        <Modal.Content.Footer.Compose>
          <Modal.Content.Footer.Group>
            {isShowForm && (
              <Row gap="m" justify="end">
                <SecondaryButton
                  size="l"
                  onClick={onClose}
                  data-testid="cancel-btn"
                >
                  Cancel
                </SecondaryButton>
                <PrimaryButton
                  size="l"
                  onClick={onSubmit}
                  disabled={isSubmitDisabled}
                  data-testid="submit-btn"
                >
                  {submitBtnText || 'Import'}
                </PrimaryButton>
              </Row>
            )}
            {data && <PrimaryButton onClick={onClose}>OK</PrimaryButton>}
          </Modal.Content.Footer.Group>
        </Modal.Content.Footer.Compose>
      </Modal.Content.Compose>
    </Modal.Compose>
  )
}

export default ImportFileModal
