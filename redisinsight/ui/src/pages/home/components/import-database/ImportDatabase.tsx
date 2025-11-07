import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import ReactDOM from 'react-dom'
import {
  fetchInstancesAction,
  importInstancesSelector,
  resetImportInstances,
  uploadInstancesFile,
} from 'uiSrc/slices/instances/instances'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RiTooltip, UploadWarning, RiFilePicker } from 'uiSrc/components'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { Title } from 'uiSrc/components/base/text/Title'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'
import { RiIcon } from 'uiSrc/components/base/icons/RiIcon'
import ResultsLog from './components/ResultsLog'

import styles from './styles.module.scss'
import { ScrollableWrapper } from '../styles.module'

export interface Props {
  onClose: () => void
}

const MAX_MB_FILE = 10
const MAX_FILE_SIZE = MAX_MB_FILE * 1024 * 1024

const ImportDatabase = (props: Props) => {
  const { onClose } = props
  const { loading, data, error } = useSelector(importInstancesSelector)
  const [files, setFiles] = useState<Nullable<FileList>>(null)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [domReady, setDomReady] = useState(false)

  const dispatch = useDispatch()
  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setDomReady(true)

    setModalHeader(<Title size="M">Import from file</Title>, true)

    return () => {
      setModalHeader(null)
    }
  }, [])

  const onFileChange = (files: FileList | null) => {
    setFiles(files)
    setIsInvalid(!!files?.length && files?.[0].size > MAX_FILE_SIZE)
    setIsSubmitDisabled(!files?.length || files[0].size > MAX_FILE_SIZE)
  }

  const handleOnClose = () => {
    onClose()
    dispatch(resetImportInstances())

    if (!data) {
      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_CANCELLED,
      })
    }
  }

  const onClickRetry = () => {
    dispatch(resetImportInstances())
    onFileChange(null)
  }

  const onSubmit = () => {
    if (files) {
      const formData = new FormData()
      formData.append('file', files[0])

      dispatch(
        uploadInstancesFile(formData, (data) => {
          if (data?.success?.length || data?.partial?.length) {
            dispatch(fetchInstancesAction())
          }
        }),
      )

      sendEventTelemetry({
        event: TelemetryEvent.CONFIG_DATABASES_REDIS_IMPORT_SUBMITTED,
      })
    }
  }

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')
    if (!domReady || !footerEl) return null

    if (error) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          <PrimaryButton
            size="s"
            color="secondary"
            onClick={onClickRetry}
            data-testid="btn-retry"
          >
            Retry
          </PrimaryButton>
        </div>,
        footerEl,
      )
    }

    if (data) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          <PrimaryButton
            size="s"
            type="submit"
            onClick={handleOnClose}
            data-testid="btn-close"
          >
            Ok
          </PrimaryButton>
        </div>,
        footerEl,
      )
    }

    return ReactDOM.createPortal(
      <Row justify="end" gap="m" data-testid="footer-import-database">
        <SecondaryButton
          className="btn-cancel"
          onClick={handleOnClose}
          style={{ marginRight: 12 }}
        >
          Cancel
        </SecondaryButton>
        <RiTooltip
          position="top"
          anchorClassName="euiToolTip__btn-disabled"
          content={isSubmitDisabled ? 'Upload a file' : undefined}
        >
          <PrimaryButton
            type="submit"
            onClick={onSubmit}
            loading={loading}
            disabled={isSubmitDisabled}
            data-testid="btn-submit"
          >
            Submit
          </PrimaryButton>
        </RiTooltip>
      </Row>,
      footerEl,
    )
  }

  const isShowForm = !loading && !data && !error

  return (
    <>
      <ScrollableWrapper data-testid="add-db_import">
        <Col gap="l">
          <FlexItem grow>
            {isShowForm && (
              <>
                <Text>
                  Use a JSON file to import your database connections. Ensure
                  that you only use files from trusted sources to prevent the
                  risk of automatically executing malicious code.
                </Text>
                <Spacer />

                <RiFilePicker
                  id="import-file-modal-filepicker"
                  initialPromptText="Select or drag and drop a file"
                  className={styles.fileDrop}
                  isInvalid={isInvalid}
                  onChange={onFileChange}
                  display="large"
                  data-testid="import-file-modal-filepicker"
                  aria-label="Select or drag and drop file"
                />
                {isInvalid && (
                  <ColorText
                    color="danger"
                    className={styles.errorFileMsg}
                    data-testid="input-file-error-msg"
                  >
                    {`File should not exceed ${MAX_MB_FILE} MB`}
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
                <RiIcon type="ToastCancelIcon" color="danger600" size="xxl" />
                <Text color="subdued" style={{ marginTop: 16 }}>
                  Failed to add database connections
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
              <ResultsLog data={data} />
            </FlexItem>
          </Row>
        )}
      </ScrollableWrapper>
      <Footer />
    </>
  )
}

export default ImportDatabase
