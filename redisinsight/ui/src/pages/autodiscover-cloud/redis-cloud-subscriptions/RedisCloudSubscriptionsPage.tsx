import React from 'react'
import RedisCloudSubscriptions from './RedisCloudSubscriptions/RedisCloudSubscriptions'
import { useCloudSubscriptionConfig } from 'uiSrc/pages/autodiscover-cloud/redis-cloud-subscriptions/useCloudSubscriptionConfig'

const RedisCloudSubscriptionsPage = () => {
  const {
    loading,
    account,
    selection,
    columns,
    subscriptions,
    subscriptionsError,
    accountError,
    handleClose,
    handleBackAdding,
    handleLoadInstances,
  } = useCloudSubscriptionConfig()

  return (
    <RedisCloudSubscriptions
      selection={selection}
      columns={columns}
      subscriptions={subscriptions}
      loading={loading}
      account={account}
      error={subscriptionsError || accountError || ''}
      onClose={handleClose}
      onBack={handleBackAdding}
      onSubmit={handleLoadInstances}
    />
  )
}

export default RedisCloudSubscriptionsPage
