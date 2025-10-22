import React from 'react'
import RedisCloudSubscriptions from './RedisCloudSubscriptions/RedisCloudSubscriptions'
import { useCloudSubscriptionConfig } from './useCloudSubscriptionConfig'

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
    handleSelectionChange,
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
      onSelectionChange={handleSelectionChange}
    />
  )
}

export default RedisCloudSubscriptionsPage
