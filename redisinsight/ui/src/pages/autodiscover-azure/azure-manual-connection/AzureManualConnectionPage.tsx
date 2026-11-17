import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from 'uiSrc/slices/hooks'
import { useFormik, FormikErrors } from 'formik'
import { isEmpty } from 'lodash'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import i18n, { useTranslation } from 'uiSrc/i18n'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import { AutodiscoveryPageTemplate } from 'uiSrc/templates'
import { Spacer } from 'uiSrc/components/base/layout'
import { Row } from 'uiSrc/components/base/layout/flex'
import {
  Header,
  Footer as AutoDiscoverFooter,
} from 'uiSrc/components/auto-discover'
import {
  PrimaryButton,
  SecondaryButton,
} from 'uiSrc/components/base/forms/buttons'
import { azureAuthAccountSelector } from 'uiSrc/slices/oauth/azure'
import { createInstanceStandaloneAction } from 'uiSrc/slices/instances/instances'
import { Instance } from 'uiSrc/slices/interfaces'

import { FormContainer, FormWrapper } from './AzureManualConnectionPage.styles'
import AzureManualConnectionForm, {
  AzureManualConnectionFormValues,
} from './AzureManualConnectionForm'

const getFormErrors = (
  values: AzureManualConnectionFormValues,
): FormikErrors<AzureManualConnectionFormValues> => {
  const errs: FormikErrors<AzureManualConnectionFormValues> = {}

  if (!values.host) {
    errs.host = i18n.t('autodiscover.azure.manual.hostRequired')
  }
  if (!values.port) {
    errs.port = i18n.t('autodiscover.azure.manual.portRequired')
  }
  if (!values.name) {
    errs.name = i18n.t('autodiscover.azure.manual.aliasRequired')
  }
  if (values.sni && !values.servername) {
    errs.servername = i18n.t('autodiscover.azure.manual.serverNameRequired')
  }

  return errs
}

const AzureManualConnectionPage = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const dispatch = useAppDispatch()
  const account = useAppSelector(azureAuthAccountSelector)

  const [loading, setLoading] = useState(false)

  // Define initialValues once to keep error state and form state in sync
  const initialValues: AzureManualConnectionFormValues = {
    host: '',
    port: '6380',
    name: '',
    username: account?.username ?? '',
    timeout: '30',
    verifyServerCert: true,
    sni: false,
    servername: '',
  }

  // Initialize errors with validation result to prevent submit button flash on first render
  const [errors, setErrors] = useState<
    FormikErrors<AzureManualConnectionFormValues>
  >(() => getFormErrors(initialValues))

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!account) {
      history.push(Pages.home)
    }
  }, [account, history])

  // Send telemetry only once on initial page load (skip if not authenticated)
  useEffect(() => {
    if (!account) return
    setTitle(i18n.t('autodiscover.azure.manual.pageTitle'))
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_MANUAL_CONNECTION_OPENED,
    })
  }, [])

  const validate = (values: AzureManualConnectionFormValues) => {
    const errs = getFormErrors(values)
    setErrors(errs)
    return errs
  }

  const handleSubmit = async (values: AzureManualConnectionFormValues) => {
    if (!account) return

    sendEventTelemetry({
      event: TelemetryEvent.AZURE_MANUAL_CONNECTION_SUBMITTED,
      eventData: {
        useSni: values.sni,
        verifyServerCert: values.verifyServerCert,
      },
    })

    setLoading(true)

    // Build the database payload
    // TLS is always enabled for Azure Cache for Redis
    const payload: Partial<Instance> = {
      host: values.host,
      port: parseInt(values.port, 10),
      name: values.name,
      username: account.username || undefined,
      tls: true,
      verifyServerCert: values.verifyServerCert,
      // Azure-specific provider info
      provider: 'AZURE_CACHE',
      // SNI (tlsServername) - important for Private Link connections
      tlsServername:
        values.sni && values.servername ? values.servername : undefined,
      // Timeout in milliseconds (convert from seconds)
      timeout: values.timeout ? parseInt(values.timeout, 10) * 1000 : undefined,
      // Azure provider details for Entra ID authentication
      // account.id contains the MSAL homeAccountId (mapped by backend)
      // Values match backend enums: CloudProvider.Azure, AzureAuthType.EntraId
      providerDetails: {
        provider: 'azure',
        authType: 'entraId',
        azureAccountId: account.id,
      } as Instance['providerDetails'],
    }

    try {
      await dispatch(
        createInstanceStandaloneAction(payload as Instance, undefined, () => {
          // On success, send telemetry and navigate home
          sendEventTelemetry({
            event: TelemetryEvent.AZURE_MANUAL_CONNECTION_SUCCEEDED,
            eventData: {
              useSni: values.sni,
              verifyServerCert: values.verifyServerCert,
            },
          })
          // Note: createInstanceStandaloneAction already handles fetchInstancesAction and success notification
          history.push(Pages.home)
        }),
      )
    } finally {
      // Reset loading state after async action completes (success or failure)
      setLoading(false)
    }
  }

  const formik = useFormik({
    initialValues,
    validate,
    validateOnMount: true,
    onSubmit: handleSubmit,
  })

  const handleBack = () => {
    history.push(Pages.azureDatabases)
  }

  const handleClose = () => {
    history.push(Pages.home)
  }

  const submitIsDisabled = () => !isEmpty(errors) || loading

  return (
    <AutodiscoveryPageTemplate>
      <FormContainer justify="start">
        <Header
          title={t('autodiscover.azure.manual.title')}
          onBack={handleBack}
          backButtonText={t('autodiscover.azure.manual.backButton')}
        />
        <Spacer size="m" />
        <FormWrapper>
          <AzureManualConnectionForm formik={formik} />
        </FormWrapper>
      </FormContainer>

      <Spacer size="l" />

      <AutoDiscoverFooter>
        <Row justify="end" gap="m" grow={false}>
          <SecondaryButton data-testid="btn-cancel" onClick={handleClose}>
            {t('autodiscover.azure.button.cancel')}
          </SecondaryButton>
          <PrimaryButton
            data-testid="btn-submit"
            disabled={submitIsDisabled()}
            loading={loading}
            onClick={() => formik.handleSubmit()}
          >
            {t('autodiscover.azure.button.addDatabase')}
          </PrimaryButton>
        </Row>
      </AutoDiscoverFooter>
    </AutodiscoveryPageTemplate>
  )
}

export default AzureManualConnectionPage
