import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { useFormik, FormikErrors } from 'formik'
import { isEmpty } from 'lodash'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
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
import { AppDispatch } from 'uiSrc/slices/store'
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
    errs.host = 'Host is required'
  }
  if (!values.port) {
    errs.port = 'Port is required'
  }
  if (!values.name) {
    errs.name = 'Database alias is required'
  }
  if (values.sni && !values.servername) {
    errs.servername = 'Server Name is required when SNI is enabled'
  }

  return errs
}

const AzureManualConnectionPage = () => {
  const history = useHistory()
  const dispatch = useDispatch<AppDispatch>()
  const account = useSelector(azureAuthAccountSelector)

  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<
    FormikErrors<AzureManualConnectionFormValues>
  >({})

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!account) {
      history.push(Pages.home)
      return
    }

    setTitle('Azure Manual Connection')

    // Send telemetry when page is opened
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_MANUAL_CONNECTION_OPENED,
    })
  }, [account, history])

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
    }

    // Handle SNI (tlsServername) - important for Private Link connections
    if (values.sni && values.servername) {
      // The backend expects tlsServername for SNI override
      ;(payload as any).tlsServername = values.servername
    }

    // Handle timeout
    if (values.timeout) {
      ;(payload as any).timeout = parseInt(values.timeout, 10) * 1000 // Convert to ms
    }

    // Add Azure provider details for Entra ID authentication
    // account.id contains the MSAL homeAccountId (mapped by backend)
    ;(payload as any).providerDetails = {
      provider: 'azure',
      authType: 'entraId',
      azureAccountId: account.id,
    }

    dispatch(
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

    setLoading(false)
  }

  const formik = useFormik({
    initialValues,
    validate,
    enableReinitialize: true,
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
          title="Manual Azure Connection"
          onBack={handleBack}
          backButtonText="Databases"
          onQueryChange={() => {}}
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
            Cancel
          </SecondaryButton>
          <PrimaryButton
            data-testid="btn-submit"
            disabled={submitIsDisabled()}
            loading={loading}
            onClick={() => formik.handleSubmit()}
          >
            Add Database
          </PrimaryButton>
        </Row>
      </AutoDiscoverFooter>
    </AutodiscoveryPageTemplate>
  )
}

export default AzureManualConnectionPage
