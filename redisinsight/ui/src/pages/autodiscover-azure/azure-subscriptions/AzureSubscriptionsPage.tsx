import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { useAzureAuth } from 'uiSrc/components/hooks/useAzureAuth'
import { useAzureAutodiscovery } from '../contexts'
import AzureSubscriptions from './AzureSubscriptions/AzureSubscriptions'
import { AzureSubscription } from 'uiSrc/slices/interfaces'

const AzureSubscriptionsPage = () => {
  const history = useHistory()
  const { initiateLogin, account } = useAzureAuth()
  const {
    subscriptionsLoading,
    subscriptionsError,
    subscriptions,
    fetchSubscriptions,
    selectSubscription,
  } = useAzureAutodiscovery()

  useEffect(() => {
    setTitle('Azure Subscriptions')
    fetchSubscriptions()
  }, [account?.id])

  const handleBack = () => {
    history.push(Pages.home)
  }

  const handleClose = () => {
    history.push(Pages.home)
  }

  const handleSubmit = (subscription: AzureSubscription) => {
    selectSubscription(subscription)
    history.push(Pages.azureDatabases)
  }

  return (
    <AzureSubscriptions
      subscriptions={subscriptions}
      loading={subscriptionsLoading}
      error={subscriptionsError}
      onBack={handleBack}
      onClose={handleClose}
      onSubmit={handleSubmit}
      onSwitchAccount={initiateLogin}
    />
  )
}

export default AzureSubscriptionsPage
