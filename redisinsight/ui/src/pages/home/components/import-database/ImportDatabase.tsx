import React, { useEffect, useState } from 'react'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'
import ReactDOM from 'react-dom'

import {
  fetchInstancesAction,
  importInstancesSelector,
  resetImportInstances,
  uploadInstancesFile,
} from 'uiSrc/slices/instances/instances'
import { Nullable } from 'uiSrc/utils'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { RiFilePicker, RiTooltip, UploadWarning } from 'uiSrc/components'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { Col, FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { InfoIcon, RiIcon } from 'uiSrc/components/base/icons'
import { Title } from 'uiSrc/components/base/text/Title'
import { ColorText, Text } from 'uiSrc/components/base/text'
import { Loader } from 'uiSrc/components/base/display'
import { useTranslation } from 'uiSrc/i18n'
import ResultsLog from './components/ResultsLog'

import { ScrollableWrapper } from '../ManualConnection.styles'

export interface Props {
  onClose: () => void
}

const MAX_MB_FILE = 10
const MAX_FILE_SIZE = MAX_MB_FILE * 1024 * 1024

const ImportDatabase = (props: Props) => {
  const { t } = useTranslation()
  const { onClose } = props
  const { loading, data, error } = useAppSelector(importInstancesSelector)
  const [files, setFiles] = useState<Nullable<FileList>>(null)
  const [isInvalid, setIsInvalid] = useState<boolean>(false)
  const [isSubmitDisabled, setIsSubmitDisabled] = useState<boolean>(true)
  const [domReady, setDomReady] = useState(false)

  const dispatch = useAppDispatch()
  const { setModalHeader } = useModalHeader()

  useEffect(() => {
    setDomReady(true)

    return () => {
      setModalHeader(null)
    }
  }, [])

  useEffect(() => {
    setModalHeader(
      <Title size="M">{t('home.importDatabase.title')}</Title>,
      true,
    )
  }, [t])

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
        <Row justify="end" gap="m" data-testid="footer-import-database">
          <PrimaryButton
            color="secondary"
            onClick={onClickRetry}
            data-testid="btn-retry"
          >
            {t('home.importDatabase.button.retry')}
          </PrimaryButton>
        </Row>,
        footerEl,
      )
    }

    if (data) {
      return ReactDOM.createPortal(
        <Row justify="end" gap="m" data-testid="footer-import-database">
          <PrimaryButton
            type="submit"
            onClick={handleOnClose}
            data-testid="btn-close"
          >
            {t('home.importDatabase.button.ok')}
          </PrimaryButton>
        </Row>,
        footerEl,
      )
    }

    return ReactDOM.createPortal(
      <Row justify="end" gap="m" data-testid="footer-import-database">
        <SecondaryButton className="btn-cancel" onClick={handleOnClose}>
          {t('home.importDatabase.button.cancel')}
        </SecondaryButton>
        <RiTooltip
          position="top"
          content={
            isSubmitDisabled
              ? t('home.importDatabase.tooltip.uploadFile')
              : undefined
          }
        >
          <PrimaryButton
            type="submit"
            onClick={onSubmit}
            loading={loading}
            disabled={isSubmitDisabled}
            icon={isSubmitDisabled ? InfoIcon : undefined}
            data-testid="btn-submit"
          >
            {t('home.importDatabase.button.submit')}
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
        <Col gap="xl">
          <Col grow gap="xl">
            {isShowForm && (
              <Col gap="xl">
                <Text>{t('home.importDatabase.description')}</Text>

                <RiFilePicker
                  id="import-file-modal-filepicker"
                  initialPromptText={t('home.importDatabase.filePicker.prompt')}
                  isInvalid={isInvalid}
                  onChange={onFileChange}
                  display="large"
                  data-testid="import-file-modal-filepicker"
                  aria-label={t('home.importDatabase.filePicker.ariaLabel')}
                />

                {isInvalid && (
                  <ColorText color="danger" data-testid="input-file-error-msg">
                    {t('home.importDatabase.error.maxFileSize', {
                      max: MAX_MB_FILE,
                    })}
                  </ColorText>
                )}
              </Col>
            )}
            {loading && (
              <Col
                justify="center"
                gap="l"
                align="center"
                data-testid="file-loading-indicator"
              >
                <Loader size="xl" />
                <Text>{t('home.importDatabase.uploading')}</Text>
              </Col>
            )}
            {error && (
              <Col
                align="center"
                gap="l"
                justify="center"
                data-testid="result-failed"
              >
                <RiIcon
                  type="IndicatorXIcon"
                  color="danger600"
                  customSize="5rem"
                />
                <Text>{t('home.importDatabase.error.failed')}</Text>
                <Text>{error}</Text>
              </Col>
            )}
          </Col>
          {isShowForm && (
            <FlexItem>
              <UploadWarning />
            </FlexItem>
          )}
        </Col>
        {data && (
          <Row justify="center">
            <ResultsLog data={data} />
          </Row>
        )}
      </ScrollableWrapper>
      <Footer />
    </>
  )
}

export default ImportDatabase
