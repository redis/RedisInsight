import React, { useEffect } from 'react'
import { useHistory } from 'react-router-dom'

import { Pages } from 'uiSrc/constants'
import { setTitle } from 'uiSrc/utils'
import { useAzureAutodiscovery } from '../contexts'
import AzureSubscriptions from './AzureSubscriptions/AzureSubscriptions'
import { AzureSubscription } from 'uiSrc/slices/interfaces'

const AzureSubscriptionsPage = () => {
  const history = useHistory()
  const {
    loading,
    error,
    subscriptions,
    fetchSubscriptions,
    selectSubscription,
    reset,
  } = useAzureAutodiscovery()

  useEffect(() => {
    setTitle('Azure Subscriptions')
    fetchSubscriptions()
  }, [])

  const handleBack = () => {
    reset()
    history.push(Pages.home)
  }

  const handleClose = () => {
    reset()
    history.push(Pages.home)
  }

  const handleSubmit = (subscription: AzureSubscription) => {
    selectSubscription(subscription)
    history.push(Pages.azureDatabases)
  }

  return (
    <AzureSubscriptions
      subscriptions={subscriptions}
      loading={loading}
      error={error}
      onBack={handleBack}
      onClose={handleClose}
      onSubmit={handleSubmit}
    />
  )
}

export default AzureSubscriptionsPage
