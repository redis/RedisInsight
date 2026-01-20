import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useDispatch, useSelector } from 'react-redux'

import * as keys from 'uiSrc/constants/keys'
import { resetInstanceUpdateAction } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { BuildType } from 'uiSrc/constants/env'
import { appRedirectionSelector } from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'

import { fieldDisplayNames, SubmitBtnText } from 'uiSrc/pages/home/constants'
import { getFormErrors } from 'uiSrc/pages/home/utils'
import { DbConnectionInfo } from 'uiSrc/pages/home/interfaces'
import { DbInfo } from 'uiSrc/pages/home/components/form'
import { DbInfoSentinel } from 'uiSrc/pages/home/components/form/sentinel'
import { caCertsSelector } from 'uiSrc/slices/instances/caCerts'
import { clientCertsSelector } from 'uiSrc/slices/instances/clientCerts'
import { appInfoSelector } from 'uiSrc/slices/app/info'

import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { useModalHeader } from 'uiSrc/contexts/ModalTitleProvider'
import { FlexItem, Row } from 'uiSrc/components/base/layout/flex'
import { Spacer } from 'uiSrc/components/base/layout/spacer'
import { ChevronLeftIcon } from 'uiSrc/components/base/icons'
import { IconButton } from 'uiSrc/components/base/forms/buttons'
import TabsComponent from 'uiSrc/components/base/layout/tabs'
import { Title } from 'uiSrc/components/base/text/Title'
import { MANUAL_FORM_TABS, ManualFormTab } from './constants'
import CloneConnection from './components/CloneConnection'
import FooterActions from './components/FooterActions'
import { AddConnection, EditConnection, EditSentinelConnection } from './forms'

import {
  ScrollableWrapper,
  ContentWrapper,
} from '../../ManualConnection.styles'

export interface Props {
  formFields: DbConnectionInfo
  submitButtonText?: SubmitBtnText
  loading: boolean
  buildType?: BuildType
  isEditMode: boolean
  isCloneMode: boolean
  setIsCloneMode: (value: boolean) => void
  onSubmit: (values: DbConnectionInfo) => void
  onTestConnection: (values: DbConnectionInfo) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
}

const getInitFieldsDisplayNames = ({ host, port, name }: any) => {
  if (!host || !port || !name) {
    return pick(fieldDisplayNames, ['host', 'port', 'name'])
  }
  return {}
}

const ManualConnectionForm = (props: Props) => {
  const {
    formFields,
    onClose,
    onSubmit,
    onTestConnection,
    onHostNamePaste,
    submitButtonText,
    buildType,
    loading,
    isEditMode,
    isCloneMode,
    setIsCloneMode,
  } = props

  const {
    id,
    host,
    name,
    port,
    db = null,
    nameFromProvider,
    sentinelMaster,
    connectionType,
    nodes = null,
    modules,
  } = formFields

  const { action } = useSelector(appRedirectionSelector)
  const { data: caCertificates } = useSelector(caCertsSelector)
  const { data: certificates } = useSelector(clientCertsSelector)
  const { server } = useSelector(appInfoSelector)

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name }),
  )
  const [activeTab, setActiveTab] = useState<ManualFormTab>(
    ManualFormTab.General,
  )

  const { setModalHeader } = useModalHeader()

  const dispatch = useDispatch()

  const formRef = useRef<HTMLDivElement>(null)

  const submitIsDisable = () => !isEmpty(errors)
  const isFromCloud = action === UrlHandlingActions.Connect

  const validate = (values: DbConnectionInfo) => {
    const errs = getFormErrors(values)

    if (
      isCloneMode &&
      connectionType === ConnectionType.Sentinel &&
      !values.sentinelMasterName
    ) {
      errs.sentinelMasterName = fieldDisplayNames.sentinelMasterName
    }

    if (!values.name) {
      errs.name = fieldDisplayNames.name
    }

    setErrors(errs)
    return errs
  }

  const formik = useFormik({
    initialValues: formFields,
    validate,
    enableReinitialize: true,
    validateOnMount: true,
    onSubmit: (values: any) => {
      onSubmit(values)
    },
  })

  const onKeyDown = (event: React.KeyboardEvent<HTMLFormElement>) => {
    if (event.key === keys.ENTER && !submitIsDisable()) {
      // event.
      formik.submitForm()
    }
  }

  useEffect(
    () =>
      // componentWillUnmount
      () => {
        setModalHeader(null)
        if (isEditMode) {
          dispatch(resetInstanceUpdateAction())
        }
      },
    [],
  )

  useEffect(() => {
    if (isCloneMode) {
      setModalHeader(
        <Row align="center" gap="s">
          <FlexItem>
            <IconButton
              onClick={handleClickBackClone}
              icon={ChevronLeftIcon}
              aria-label="back"
              data-testid="back-btn"
            />
          </FlexItem>
          <FlexItem grow>
            <Title size="L">Clone Database</Title>
          </FlexItem>
        </Row>,
      )
      return
    }

    if (isEditMode) {
      setModalHeader(<Title size="L">Edit Database</Title>)
      return
    }

    setModalHeader(<Title size="L">Connection settings</Title>, true)
  }, [isEditMode, isCloneMode])

  useEffect(() => {
    formik.resetForm()
  }, [isCloneMode])

  const handleTestConnectionDatabase = () => {
    onTestConnection(formik.values)
  }

  const handleClickBackClone = () => {
    setIsCloneMode(false)
    sendEventTelemetry({
      event: TelemetryEvent.CONFIG_DATABASES_DATABASE_CLONE_CANCELLED,
      eventData: {
        databaseId: id,
      },
    })
  }

  const handleTabClick = (tab: ManualFormTab) => {
    setActiveTab(tab)
  }

  const Footer = () => {
    const footerEl = document.getElementById('footerDatabaseForm')

    if (!footerEl) return null

    return ReactDOM.createPortal(
      <FooterActions
        submitIsDisable={submitIsDisable}
        errors={errors}
        isLoading={loading}
        onClickTestConnection={handleTestConnectionDatabase}
        onClose={onClose}
        onClickSubmit={formik.submitForm}
        submitButtonText={submitButtonText}
      />,
      footerEl,
    )
  }

  const Tabs = () => (
    <TabsComponent
      tabs={MANUAL_FORM_TABS}
      value={activeTab}
      onChange={(id) => handleTabClick(id as ManualFormTab)}
      data-testid="manual-form-tabs"
    />
  )

  return (
    <ContentWrapper data-testid="add-db_manual">
      {isEditMode &&
        !isCloneMode &&
        server?.buildType !== BuildType.RedisStack && (
          <CloneConnection id={id} setIsCloneMode={setIsCloneMode} />
        )}
      <ContentWrapper as="div" ref={formRef}>
        {!isEditMode && !isFromCloud && (
          <>
            <Tabs />
            <Spacer />
            <ScrollableWrapper>
              <AddConnection
                activeTab={activeTab}
                formik={formik}
                onKeyDown={onKeyDown}
                onHostNamePaste={onHostNamePaste}
                certificates={certificates}
                caCertificates={caCertificates}
                buildType={buildType}
              />
            </ScrollableWrapper>
          </>
        )}
        {(isEditMode || isCloneMode || isFromCloud) &&
          connectionType !== ConnectionType.Sentinel && (
            <>
              {!isCloneMode && (
                <>
                  <DbInfo
                    host={host}
                    port={port}
                    connectionType={connectionType}
                    db={db}
                    modules={modules}
                    nameFromProvider={nameFromProvider}
                    nodes={nodes}
                    isFromCloud={isFromCloud}
                  />
                  <Spacer />
                </>
              )}
              <Tabs />
              <Spacer />
              <ScrollableWrapper>
                <EditConnection
                  activeTab={activeTab}
                  isCloneMode={isCloneMode}
                  isEditMode={isEditMode}
                  isFromCloud={isFromCloud}
                  formik={formik}
                  onKeyDown={onKeyDown}
                  onHostNamePaste={onHostNamePaste}
                  certificates={certificates}
                  caCertificates={caCertificates}
                  buildType={buildType}
                />
              </ScrollableWrapper>
            </>
          )}
        {(isEditMode || isCloneMode) &&
          connectionType === ConnectionType.Sentinel && (
            <>
              {!isCloneMode && (
                <>
                  <DbInfoSentinel
                    nameFromProvider={nameFromProvider}
                    connectionType={connectionType}
                    sentinelMaster={sentinelMaster}
                    host={host}
                    port={port}
                  />
                  <Spacer />
                </>
              )}
              <Tabs />
              <Spacer />
              <ScrollableWrapper>
                <EditSentinelConnection
                  activeTab={activeTab}
                  isCloneMode={isCloneMode}
                  formik={formik}
                  onKeyDown={onKeyDown}
                  onHostNamePaste={onHostNamePaste}
                  certificates={certificates}
                  caCertificates={caCertificates}
                  db={db}
                />
              </ScrollableWrapper>
            </>
          )}
      </ContentWrapper>
      <Footer />
    </ContentWrapper>
  )
}

export default ManualConnectionForm
