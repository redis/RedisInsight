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
import { RiCol, RiFlexItem, RiRow } from 'uiSrc/components/base/layout'
import { RiSpacer } from 'uiSrc/components/base/layout/spacer'
import { RiPrimaryButton, RiSecondaryButton } from 'uiSrc/components/base/forms'
import { InfoIcon, RiIcon } from 'uiSrc/components/base/icons'
import { RiTitle } from 'uiSrc/components/base/text/RiTitle'
import { RiColorText, RiText } from 'uiSrc/components/base/text'
import { RiLoader } from 'uiSrc/components/base/display'
import ResultsLog from './components/ResultsLog'

import styles from './styles.module.scss'

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

    setModalHeader(<RiTitle size="M">Import from file</RiTitle>, true)

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
          <RiPrimaryButton
            size="s"
            color="secondary"
            onClick={onClickRetry}
            data-testid="btn-retry"
          >
            Retry
          </RiPrimaryButton>
        </div>,
        footerEl,
      )
    }

    if (data) {
      return ReactDOM.createPortal(
        <div className="footerAddDatabase">
          <RiPrimaryButton
            size="s"
            type="submit"
            onClick={handleOnClose}
            data-testid="btn-close"
          >
            Ok
          </RiPrimaryButton>
        </div>,
        footerEl,
      )
    }

    return ReactDOM.createPortal(
      <div className="footerAddDatabase">
        <RiSecondaryButton
          size="s"
          className="btn-cancel"
          onClick={handleOnClose}
          style={{ marginRight: 12 }}
        >
          Cancel
        </RiSecondaryButton>
        <RiTooltip
          position="top"
          anchorClassName="euiToolTip__btn-disabled"
          content={isSubmitDisabled ? 'Upload a file' : undefined}
        >
          <RiPrimaryButton
            size="s"
            type="submit"
            onClick={onSubmit}
            loading={loading}
            disabled={isSubmitDisabled}
            icon={isSubmitDisabled ? InfoIcon : undefined}
            data-testid="btn-submit"
          >
            Submit
          </RiPrimaryButton>
        </RiTooltip>
      </div>,
      footerEl,
    )
  }

  const isShowForm = !loading && !data && !error

  return (
    <>
      <div className={styles.formWrapper} data-testid="add-db_import">
        <RiCol>
          <RiFlexItem grow>
            {isShowForm && (
              <>
                <RiText color="subdued" size="s">
                  Use a JSON file to import your database connections. Ensure
                  that you only use files from trusted sources to prevent the
                  risk of automatically executing malicious code.
                </RiText>
                <RiSpacer />

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
                  <RiColorText
                    color="danger"
                    className={styles.errorFileMsg}
                    data-testid="input-file-error-msg"
                  >
                    {`File should not exceed ${MAX_MB_FILE} MB`}
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
                <RiIcon type="ToastCancelIcon" color="danger600" size="xxl" />
                <RiText color="subdued" style={{ marginTop: 16 }}>
                  Failed to add database connections
                </RiText>
                <RiText color="subdued">{error}</RiText>
              </div>
            )}
          </RiFlexItem>
          {isShowForm && (
            <RiFlexItem grow className={styles.uploadWarningContainer}>
              <UploadWarning />
            </RiFlexItem>
          )}
        </RiCol>
        {data && (
          <RiRow justify="center">
            <RiFlexItem grow style={{ maxWidth: '100%' }}>
              <ResultsLog data={data} />
            </RiFlexItem>
          </RiRow>
        )}
      </div>
      <Footer />
    </>
  )
}

export default ImportDatabase
