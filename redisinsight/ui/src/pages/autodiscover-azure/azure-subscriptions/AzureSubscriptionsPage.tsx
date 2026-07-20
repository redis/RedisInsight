import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { useTranslation } from 'uiSrc/i18n'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { AzureSignInDialog } from 'uiSrc/components/azure-sign-in-dialog'
import { azureAuthTenantSelector } from 'uiSrc/slices/oauth/azure'
import { AzureLoginSource, AzureSubscription } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  azureSelector,
  clearSubscriptionsAzure,
  fetchSubscriptionsAzure,
  setSelectedSubscriptionAzure,
} from 'uiSrc/slices/instances/azure'
import AzureSubscriptions from './AzureSubscriptions/AzureSubscriptions'

const AzureSubscriptionsPage = () => {
  const { t } = useTranslation()
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { initiateLogin, loading: azureLoading, account } = useAzureAuth()
  const tenant = useAppSelector(azureAuthTenantSelector)
  const [isSignInDialogOpen, setIsSignInDialogOpen] = useState(false)
  const { loading, error, subscriptions, loaded } =
    useAppSelector(azureSelector)

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!account) {
      history.push(Pages.home)
      return
    }

    setTitle(t('autodiscover.azure.subscriptions.title'))

    if (!loaded.subscriptions) {
      dispatch(fetchSubscriptionsAzure(account.id, tenant ?? undefined))
    }
    // tenant is a dep so account and the fetched tenant never read out of sync.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, tenant])

  const handleBack = () => {
    history.push(Pages.home)
  }

  const handleClose = () => {
    history.push(Pages.home)
  }

  const handleSubmit = (subscription: AzureSubscription) => {
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_SUBSCRIPTION_SELECTED,
    })
    dispatch(setSelectedSubscriptionAzure(subscription))
    history.push(Pages.azureDatabases)
  }

  const handleRefresh = () => {
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_SUBSCRIPTIONS_REFRESH_CLICKED,
    })
    if (account?.id) {
      dispatch(clearSubscriptionsAzure())
      dispatch(fetchSubscriptionsAzure(account.id, tenant ?? undefined))
    }
  }

  const handleSwitchAccount = () => {
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_SWITCH_ACCOUNT_CLICKED,
    })
    setIsSignInDialogOpen(true)
  }

  const handleSignIn = (tenantId?: string) => {
    setIsSignInDialogOpen(false)
    initiateLogin(AzureLoginSource.Autodiscovery, tenantId)
  }

  const handleManualConnection = () => {
    history.push(Pages.azureManualConnection)
  }

  return (
    <>
      <AzureSubscriptions
        subscriptions={subscriptions || []}
        loading={loading}
        error={error}
        onBack={handleBack}
        onClose={handleClose}
        onSubmit={handleSubmit}
        onSwitchAccount={handleSwitchAccount}
        onRefresh={handleRefresh}
        onManualConnection={handleManualConnection}
      />
      <AzureSignInDialog
        isOpen={isSignInDialogOpen}
        loading={azureLoading}
        onClose={() => setIsSignInDialogOpen(false)}
        onSignIn={handleSignIn}
      />
    </>
  )
}

export default AzureSubscriptionsPage
