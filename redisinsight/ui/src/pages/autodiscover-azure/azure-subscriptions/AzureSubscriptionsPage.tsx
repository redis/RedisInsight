import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from 'uiSrc/slices/hooks'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { azureAuthTenantSelector } from 'uiSrc/slices/oauth/azure'
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import { sendEventTelemetry, TelemetryEvent } from 'uiSrc/telemetry'
import {
  azureSelector,
  clearSubscriptionsAzure,
  fetchSubscriptionsAzure,
  setSelectedSubscriptionAzure,
} from 'uiSrc/slices/instances/azure'
import AzureSubscriptions from './AzureSubscriptions/AzureSubscriptions'

const AzureSubscriptionsPage = () => {
  const history = useHistory()
  const dispatch = useAppDispatch()
  const { initiateLogin, account } = useAzureAuth()
  const tenant = useAppSelector(azureAuthTenantSelector)
  const { loading, error, subscriptions, loaded } =
    useAppSelector(azureSelector)

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!account) {
      history.push(Pages.home)
      return
    }

    setTitle('Azure Subscriptions')

    // Only fetch if not already loaded or if account changed
    if (!loaded.subscriptions) {
      dispatch(fetchSubscriptionsAzure(account.id, tenant ?? undefined))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account])

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
    initiateLogin()
  }

  const handleManualConnection = () => {
    history.push(Pages.azureManualConnection)
  }

  return (
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
  )
}

export default AzureSubscriptionsPage
