import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import { AppDispatch } from 'uiSrc/slices/store'
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
  const dispatch = useDispatch<AppDispatch>()
  const { initiateLogin, account } = useAzureAuth()
  const { loading, error, subscriptions, loaded } = useSelector(azureSelector)

  useEffect(() => {
    // Redirect to home if not authenticated
    if (!account) {
      history.push(Pages.home)
      return
    }

    setTitle('Azure Subscriptions')

    // Only fetch if not already loaded or if account changed
    if (!loaded.subscriptions) {
      dispatch(fetchSubscriptionsAzure(account.id))
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
      dispatch(fetchSubscriptionsAzure(account.id))
    }
  }

  const handleSwitchAccount = () => {
    sendEventTelemetry({
      event: TelemetryEvent.AZURE_SWITCH_ACCOUNT_CLICKED,
    })
    initiateLogin()
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
    />
  )
}

export default AzureSubscriptionsPage
