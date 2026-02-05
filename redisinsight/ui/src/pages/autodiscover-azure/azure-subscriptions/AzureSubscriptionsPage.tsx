import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { AzureSubscription } from 'uiSrc/slices/interfaces'
import { AppDispatch } from 'uiSrc/slices/store'
import {
  azureSelector,
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
    setTitle('Azure Subscriptions')

    // Only fetch if not already loaded or if account changed
    if (account?.id && !loaded.subscriptions) {
      dispatch(fetchSubscriptionsAzure(account.id))
    }
  }, [account?.id, loaded.subscriptions])

  const handleBack = () => {
    history.push(Pages.home)
  }

  const handleClose = () => {
    history.push(Pages.home)
  }

  const handleSubmit = (subscription: AzureSubscription) => {
    dispatch(setSelectedSubscriptionAzure(subscription))
    history.push(Pages.azureDatabases)
  }

  return (
    <AzureSubscriptions
      subscriptions={subscriptions || []}
      loading={loading}
      error={error}
      onBack={handleBack}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onSwitchAccount={initiateLogin}
    />
  )
}

export default AzureSubscriptionsPage
