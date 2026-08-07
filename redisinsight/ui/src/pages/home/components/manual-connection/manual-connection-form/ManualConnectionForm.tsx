import { FormikErrors, useFormik } from 'formik'
import { isEmpty, pick } from 'lodash'
import React, { useEffect, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import * as keys from 'uiSrc/constants/keys'
import { resetInstanceUpdateAction } from 'uiSrc/slices/instances/instances'
import { ConnectionType } from 'uiSrc/slices/interfaces'
import { BuildType } from 'uiSrc/constants/env'
import { appRedirectionSelector } from 'uiSrc/slices/app/url-handling'
import { UrlHandlingActions } from 'uiSrc/slices/interfaces/urlHandling'

import { ParseKeys } from 'i18next'
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
import i18n, { useTranslation } from 'uiSrc/i18n'
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
  isFromAzure?: boolean
  isManaged?: boolean
  setIsCloneMode: (value: boolean) => void
  onSubmit: (values: DbConnectionInfo) => void
  onTestConnection: (values: DbConnectionInfo) => void
  onHostNamePaste: (content: string) => boolean
  onClose?: () => void
}

const getInitFieldsDisplayNames = ({ host, port, name }: any) => {
  if (!host || !port || !name) {
    const picked = pick(fieldDisplayNames, ['host', 'port', 'name'])
    return Object.fromEntries(
      Object.entries(picked).map(([key, value]) => [key, i18n.t(value)]),
    )
  }
  return {}
}

const ManualConnectionForm = (props: Props) => {
  const { t } = useTranslation()
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
    isFromAzure = false,
    isManaged = false,
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

  const { action } = useAppSelector(appRedirectionSelector)
  const { data: caCertificates } = useAppSelector(caCertsSelector)
  const { data: certificates } = useAppSelector(clientCertsSelector)
  const { server } = useAppSelector(appInfoSelector)

  const [errors, setErrors] = useState<FormikErrors<DbConnectionInfo>>(
    getInitFieldsDisplayNames({ host, port, name }),
  )
  const [activeTab, setActiveTab] = useState<ManualFormTab>(
    ManualFormTab.General,
  )

  const { setModalHeader } = useModalHeader()

  const dispatch = useAppDispatch()

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
      errs.sentinelMasterName = t(fieldDisplayNames.sentinelMasterName)
    }

    if (!values.name) {
      errs.name = t(fieldDisplayNames.name)
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
              aria-label={t('home.form.ariaLabel.back')}
              data-testid="back-btn"
            />
          </FlexItem>
          <FlexItem grow>
            <Title size="L">{t('home.form.manual.title.cloneDatabase')}</Title>
          </FlexItem>
        </Row>,
      )
      return
    }

    if (isEditMode) {
      setModalHeader(
        <Title size="L">{t('home.form.manual.title.editDatabase')}</Title>,
      )
      return
    }

    setModalHeader(
      <Title size="L">{t('home.form.manual.title.connectionSettings')}</Title>,
      true,
    )
  }, [isEditMode, isCloneMode, t])

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
      tabs={MANUAL_FORM_TABS.map((tab) => ({
        ...tab,
        label: t(tab.label as ParseKeys),
      }))}
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
                    isManaged={isManaged}
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
                  isFromAzure={isFromAzure}
                  isManaged={isManaged}
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
