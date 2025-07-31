import {
  EuiModal,
  EuiModalBody,
  EuiModalFooter,
  EuiModalHeader,
  EuiModalHeaderTitle,
} from '@elastic/eui'
import cx from 'classnames'
import React from 'react'

import { Nullable } from 'uiSrc/utils'

import { RiFilePicker, UploadWarning } from 'uiSrc/components'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import styles from './styles.module.scss'

export interface Props<T> {
  onClose: () => void
  onFileChange: (files: FileList | null) => void
  onSubmit: () => void
  modalClassName?: string
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
  modalClassName,
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
    <EuiModal
      onClose={onClose}
      className={cx(styles.modal, modalClassName)}
      data-testid="import-file-modal"
    >
      <EuiModalHeader>
        <EuiModalHeaderTitle>
          <Title size="XS" data-testid="import-file-modal-title">
            <span>
              {!data && !error ? title : resultsTitle || 'Import Results'}
            </span>
          </Title>
        </EuiModalHeaderTitle>
      </EuiModalHeader>

      <EuiModalBody>
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
                <RiIcon type="ToastCancelIcon" size="XL" color="danger500" />
                <Text color="subdued" style={{ marginTop: 16 }}>
                  {errorMessage}
                </Text>
                <Text color="subdued">{error}</Text>
              </div>
            )}
          </FlexItem>
          {isShowForm && (
            <FlexItem grow className={styles.uploadWarningContainer}>
              <UploadWarning />
            </FlexItem>
          )}
        </Col>
        {data && (
          <Row justify="center">
            <FlexItem grow style={{ maxWidth: '100%' }}>
              {submitResults}
            </FlexItem>
          </Row>
        )}
      </EuiModalBody>

      {data && (
        <EuiModalFooter>
          <PrimaryButton onClick={onClose} data-testid="ok-btn">
            Ok
          </PrimaryButton>
        </EuiModalFooter>
      )}

      {isShowForm && (
        <EuiModalFooter>
          <SecondaryButton onClick={onClose} data-testid="cancel-btn">
            Cancel
          </SecondaryButton>

          <PrimaryButton
            onClick={onSubmit}
            disabled={isSubmitDisabled}
            data-testid="submit-btn"
          >
            {submitBtnText || 'Import'}
          </PrimaryButton>
        </EuiModalFooter>
      )}
    </EuiModal>
  )
}

export default ImportFileModal
